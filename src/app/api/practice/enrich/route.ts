import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { checkUserRateLimit } from "@/lib/rate-limiter"
import { PROBLEM_BANK } from "@/data/problem-bank"

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

// POST /api/practice/enrich - Enrich a bank problem with AI-generated details
export async function POST(req: NextRequest) {
  try {
    if (!anthropic) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    const session = await getServerSession(authOptions)
    let userId = "anonymous"
    let plan: string | null = null

    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: { company: true },
      })
      if (user) {
        userId = user.id
        plan = user.company?.plan || null
      }
    }

    // Rate limit
    const rateCheck = checkUserRateLimit(userId, "aiGenerations", plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Enrichment limit reached (${rateCheck.limit}/day).` },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { bankProblemId } = body

    if (!bankProblemId) {
      return NextResponse.json({ error: "bankProblemId is required" }, { status: 400 })
    }

    // Check cache first
    const cached = await prisma.enrichedBankProblem.findUnique({
      where: { bankProblemId },
    })

    if (cached) {
      return NextResponse.json({
        constraints: cached.constraints,
        examples: cached.examples,
        starterCode: cached.starterCode ? JSON.parse(cached.starterCode) : null,
        testCases: cached.testCases ? JSON.parse(cached.testCases) : null,
      })
    }

    // Find the problem in the bank
    const problem = PROBLEM_BANK.find((p) => p.id === bankProblemId)
    if (!problem) {
      return NextResponse.json({ error: "Problem not found in bank" }, { status: 404 })
    }

    const prompt = `Given this coding interview problem, generate enriched details:

Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}
Tags: ${problem.tags.join(", ")}

Generate a JSON object with:
1. "constraints" - Input/output constraints and data ranges (string with newlines)
2. "examples" - 2-3 examples with input, output, and explanation (string with newlines)
3. "starterCode" - Starter code with function signature and test cases for JavaScript, Python, and Java
4. "testCases" - Array of test cases with input and expected output

Return ONLY valid JSON, no markdown:
{
  "constraints": "...",
  "examples": "...",
  "starterCode": {
    "javascript": "// code with function signature and console.log test calls",
    "python": "# code with function signature and print test calls",
    "java": "// code with class, method signature, and main method with test calls"
  },
  "testCases": [
    { "input": "description of input", "expected": "expected output string" }
  ]
}`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""

    let parsed
    try {
      let jsonText = text.trim()
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "")
      }
      parsed = JSON.parse(jsonText)
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
    }

    // Cache in database
    await prisma.enrichedBankProblem.create({
      data: {
        bankProblemId,
        constraints: parsed.constraints || null,
        examples: parsed.examples || null,
        starterCode: parsed.starterCode ? JSON.stringify(parsed.starterCode) : null,
        testCases: parsed.testCases ? JSON.stringify(parsed.testCases) : null,
      },
    }).catch((err) => {
      console.error("Failed to cache enriched problem:", err)
    })

    return NextResponse.json({
      constraints: parsed.constraints,
      examples: parsed.examples,
      starterCode: parsed.starterCode,
      testCases: parsed.testCases,
    })
  } catch (error) {
    console.error("Practice enrich error:", error)
    return NextResponse.json({ error: "Failed to enrich problem" }, { status: 500 })
  }
}
