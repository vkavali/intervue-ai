import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { checkUserRateLimit } from "@/lib/rate-limiter"

const anthropic = new Anthropic()

// POST /api/positions/generate - AI Generate a full job description
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Only company admins can generate JDs" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    })

    const plan = user?.company?.plan || null
    const rateCheck = checkUserRateLimit(session.user.id, "aiGenerations", plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `JD generation limit reached (${rateCheck.limit}/day). Upgrade your plan for more.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetIn) } }
      )
    }

    const body = await req.json()
    const { title, department, seniority, industry } = body

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Job title is required" }, { status: 400 })
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: `You are an expert HR and recruitment professional. Generate a compelling, professional job description based on the given role title and context. Respond with ONLY a valid JSON object (no markdown fences).

The JSON must have this structure:
{
  "title": "string - professional job title",
  "role": "string - the core role name",
  "description": "string - 2-3 paragraph overview of the role and company need",
  "requirements": "string - bullet-pointed list of requirements (use \\n- for each bullet)",
  "benefits": "string - bullet-pointed list of benefits (use \\n- for each bullet)",
  "department": "string - the department this role belongs to",
  "seniority": "JUNIOR | MID | SENIOR | STAFF | PRINCIPAL"
}

Guidelines:
- Make the description engaging and specific, not generic
- Requirements should include 6-10 bullet points covering experience, skills, and qualifications
- Benefits should include 5-8 bullet points covering compensation, perks, and culture
- Match seniority expectations to the provided level
- If industry is provided, tailor the language and requirements to that domain`,
      messages: [{
        role: "user",
        content: `Generate a job description for: "${title.trim()}"
${department ? `Department: ${department}` : ""}
${seniority ? `Seniority: ${seniority}` : ""}
${industry ? `Industry: ${industry}` : ""}`,
      }],
    })

    const textBlock = response.content.find(b => b.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Failed to generate JD" }, { status: 500 })
    }

    let rawText = textBlock.text.trim()
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "")
    }

    const parsed = JSON.parse(rawText)

    return NextResponse.json({
      title: parsed.title || title,
      role: parsed.role || title,
      description: parsed.description || "",
      requirements: parsed.requirements || "",
      benefits: parsed.benefits || "",
      department: parsed.department || department || "",
      seniority: parsed.seniority || seniority || "MID",
    })
  } catch (error) {
    console.error("POST /api/positions/generate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
