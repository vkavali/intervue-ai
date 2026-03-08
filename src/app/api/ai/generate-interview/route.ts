import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic()

// POST /api/ai/generate-interview - Generate a complete interview template from natural language
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only COMPANY_ADMIN and INTERVIEWER can generate interviews
    if (
      session.user.role !== "COMPANY_ADMIN" &&
      session.user.role !== "INTERVIEWER"
    ) {
      return NextResponse.json(
        { error: "Only company admins and interviewers can generate interview templates" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { prompt, role, seniority } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A prompt describing the interview is required" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert technical interview designer. Your job is to generate a complete, well-structured interview template from a natural language description provided by an employer.

You must respond with ONLY a valid JSON object (no markdown fences, no extra text). The JSON must have this exact structure:

{
  "template": {
    "title": "string - descriptive interview template title",
    "role": "string - the target role (e.g., Frontend Engineer, Backend Engineer, Full Stack Developer)",
    "seniority": "JUNIOR | MID | SENIOR | STAFF | PRINCIPAL",
    "roundType": "string - the interview round type (e.g., Technical, System Design, Live Coding, Frontend, Backend, DSA)",
    "defaultAiLevel": "number 0-4 - default AI assistance level for the interview",
    "questions": [
      {
        "title": "string - clear, concise problem title",
        "description": "string - detailed problem description with input/output format",
        "constraints": "string - input/output constraints and data ranges",
        "examples": "string - 2-3 examples with input, output, and explanation",
        "difficulty": "EASY | MEDIUM | HARD",
        "aiLevel": "number 0-4 - AI level for this specific question",
        "timeLimit": "number - time limit in minutes",
        "orderIndex": "number - 0-based question order"
      }
    ]
  },
  "assessmentCriteria": "string - detailed criteria for evaluating the candidate's performance. Include what to look for in terms of problem-solving approach, code quality, communication, and technical depth.",
  "interviewerGuidance": "string - practical tips for the interviewer conducting this interview. Include how to introduce questions, when to give hints, what follow-up questions to ask, and how to manage time."
}

Guidelines:
- Parse the employer's natural language description to understand their requirements
- Determine the appropriate role, seniority, and round type from context clues
- Generate 3-5 well-structured questions that match the requirements
- Distribute difficulty levels appropriately (e.g., start easier, progress to harder)
- Set AI levels per question based on what the employer describes:
  - If they want minimal help: use L0-L1
  - If they want moderate assistance: use L2
  - If they want guided help: use L3
  - If they want full copilot: use L4
- Make questions practical and relevant to the specified role
- Provide actionable assessment criteria and interviewer guidance
- Ensure the total time of all questions is reasonable (typically 30-90 minutes)
- Questions should progress in difficulty and build on related concepts`

    const userPrompt = `Generate a complete interview template based on this description:

"${prompt}"

${role ? `Additional context - Target Role: ${role}` : ""}
${seniority ? `Additional context - Seniority Level: ${seniority}` : ""}`

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === "text")
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Failed to generate interview template - no response from AI" },
        { status: 500 }
      )
    }

    // Parse the JSON response, stripping any potential markdown fences
    let rawText = textBlock.text.trim()
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "")
    }

    let parsed: {
      template: {
        title: string
        role: string
        seniority: string
        roundType: string
        defaultAiLevel: number
        questions: Array<{
          title: string
          description: string
          constraints: string
          examples: string
          difficulty: string
          aiLevel: number
          timeLimit: number
          orderIndex: number
        }>
      }
      assessmentCriteria: string
      interviewerGuidance: string
    }

    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error("Failed to parse AI response as JSON:", rawText)
      return NextResponse.json(
        { error: "Failed to parse AI-generated interview template. Please try again." },
        { status: 500 }
      )
    }

    // Validate the parsed structure
    if (!parsed.template || !parsed.template.questions || !Array.isArray(parsed.template.questions)) {
      return NextResponse.json(
        { error: "AI response did not contain a valid template structure. Please try again." },
        { status: 500 }
      )
    }

    // Normalize the template data
    const validSeniorities = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"]
    const template = {
      title: parsed.template.title || "AI-Generated Interview",
      role: parsed.template.role || role || "Software Engineer",
      seniority: validSeniorities.includes(parsed.template.seniority)
        ? parsed.template.seniority
        : seniority || "MID",
      roundType: parsed.template.roundType || "Technical",
      defaultAiLevel:
        typeof parsed.template.defaultAiLevel === "number" &&
        parsed.template.defaultAiLevel >= 0 &&
        parsed.template.defaultAiLevel <= 4
          ? parsed.template.defaultAiLevel
          : 0,
      questions: parsed.template.questions.map((q, index) => ({
        title: q.title || `Question ${index + 1}`,
        description: q.description || "",
        constraints: q.constraints || "",
        examples: q.examples || "",
        difficulty: ["EASY", "MEDIUM", "HARD"].includes(q.difficulty)
          ? q.difficulty
          : "MEDIUM",
        aiLevel:
          typeof q.aiLevel === "number" && q.aiLevel >= 0 && q.aiLevel <= 4
            ? q.aiLevel
            : parsed.template.defaultAiLevel || 0,
        timeLimit:
          typeof q.timeLimit === "number" && q.timeLimit >= 5 && q.timeLimit <= 120
            ? q.timeLimit
            : 30,
        orderIndex: typeof q.orderIndex === "number" ? q.orderIndex : index,
      })),
    }

    return NextResponse.json({
      template,
      assessmentCriteria: parsed.assessmentCriteria || "",
      interviewerGuidance: parsed.interviewerGuidance || "",
    })
  } catch (error) {
    console.error("POST /api/ai/generate-interview error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
