import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { checkUserRateLimit } from "@/lib/rate-limiter"

const anthropic = new Anthropic()

// POST /api/ai/generate-questions - Generate interview questions using AI
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only COMPANY_ADMIN and INTERVIEWER can generate questions
    if (
      session.user.role !== "COMPANY_ADMIN" &&
      session.user.role !== "INTERVIEWER"
    ) {
      return NextResponse.json(
        { error: "Only company admins and interviewers can generate questions" },
        { status: 403 }
      )
    }

    // Rate limit check
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    })
    const plan = user?.company?.plan || null
    const rateCheck = checkUserRateLimit(session.user.id, "aiGenerations", plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Question generation limit reached (${rateCheck.limit}/day). Upgrade your plan for more.`,
          remaining: 0,
          limit: rateCheck.limit,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetIn) } }
      )
    }

    const body = await req.json()
    const { role, seniority, roundType, count, topics, difficulty, interviewType } = body

    // Validate required fields
    if (!role || !seniority || !roundType || !count) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: role, seniority, roundType, count",
        },
        { status: 400 }
      )
    }

    // Validate count range
    const questionCount = Math.min(Math.max(parseInt(count), 1), 10)

    // Validate seniority
    const validSeniorities = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"]
    if (!validSeniorities.includes(seniority)) {
      return NextResponse.json(
        { error: "Invalid seniority. Must be one of: " + validSeniorities.join(", ") },
        { status: 400 }
      )
    }

    // Validate difficulty if provided
    const validDifficulties = ["EASY", "MEDIUM", "HARD", "MIX"]
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty. Must be one of: " + validDifficulties.join(", ") },
        { status: 400 }
      )
    }

    const systemPrompt = `You are an expert technical interview question designer. Your job is to generate high-quality coding interview questions.

You must respond with ONLY a valid JSON object (no markdown fences, no extra text). The JSON must have this exact structure:

{
  "questions": [
    {
      "title": "string - clear, concise problem title",
      "description": "string - detailed problem description explaining what the candidate needs to implement. Include input/output format.",
      "constraints": "string - input/output constraints, data ranges, and edge cases. Use newlines to separate each constraint.",
      "examples": "string - 2-3 examples with input, output, and brief explanation. Format each example clearly.",
      "difficulty": "EASY | MEDIUM | HARD",
      "timeLimit": "number - suggested time limit in minutes (5-60)",
      "aiLevel": "number 0-4 - suggested AI assistance level. 0=no AI, 1=hints only, 2=scaffold, 3=guided explanation, 4=full copilot"
    }
  ]
}

Guidelines for generating questions:
- Make questions practical and relevant to real-world engineering problems
- Scale difficulty and complexity based on the seniority level
- For JUNIOR: focus on fundamentals, basic data structures, simple algorithms
- For MID: moderate complexity, common patterns, standard algorithms
- For SENIOR: advanced algorithms, optimization, system-level thinking
- For STAFF/PRINCIPAL: complex design problems, trade-off analysis, multi-step solutions
- Each question should have a clear, unambiguous problem statement
- Include meaningful constraints that guide the solution approach
- Provide examples that cover normal cases and at least one edge case
- Set aiLevel based on difficulty: harder questions may warrant higher AI levels
- Time limits should be realistic for the difficulty level
- Ensure variety in the question set - avoid repetitive patterns
- IMPORTANT: Generate questions ONLY relevant to the specified role and round type. Do NOT generate general knowledge, trivia, geography, history, or off-topic content.
- If the round type or interview type is non-technical (Behavioral, PM, BA), generate scenario-based questions, NOT coding questions.
- For DevOps rounds: generate infrastructure, CI/CD, cloud, monitoring, and deployment questions, NOT coding algorithm problems.
- For Business Analysis rounds: generate requirements gathering, case study, and stakeholder analysis questions, NOT algorithm problems.
- For Project Management rounds: generate project planning, risk management, and stakeholder scenario questions, NOT code.
- For SQL interviews, generate SQL query/schema design questions.
- For non-coding round types, do NOT generate coding or algorithm questions. Generate scenario-based, analytical, or domain-specific questions appropriate for the round type.`

    const userPrompt = `Generate ${questionCount} coding interview question${questionCount > 1 ? "s" : ""} with the following requirements:

- Role: ${role}
- Seniority Level: ${seniority}
- Round Type: ${roundType}
${topics ? `- Specific Topics to Cover: ${topics}` : ""}
${difficulty && difficulty !== "MIX" ? `- All questions should be ${difficulty} difficulty` : difficulty === "MIX" ? "- Include a mix of EASY, MEDIUM, and HARD questions" : ""}
${interviewType ? `- Interview Type: ${interviewType}` : ""}

Generate exactly ${questionCount} question${questionCount > 1 ? "s" : ""}.`

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
        { error: "Failed to generate questions - no response from AI" },
        { status: 500 }
      )
    }

    // Parse the JSON response, stripping any potential markdown fences
    let rawText = textBlock.text.trim()
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```$/, "")
    }

    let parsed: { questions: Array<{
      title: string
      description: string
      constraints: string
      examples: string
      difficulty: string
      timeLimit: number
      aiLevel: number
    }> }

    try {
      parsed = JSON.parse(rawText)
    } catch {
      console.error("Failed to parse AI response as JSON:", rawText)
      return NextResponse.json(
        { error: "Failed to parse AI-generated questions. Please try again." },
        { status: 500 }
      )
    }

    // Validate the parsed structure
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json(
        { error: "AI response did not contain a valid questions array. Please try again." },
        { status: 500 }
      )
    }

    // Normalize and validate each question
    const questions = parsed.questions.map((q) => ({
      title: q.title || "Untitled Question",
      description: q.description || "",
      constraints: q.constraints || "",
      examples: q.examples || "",
      difficulty: ["EASY", "MEDIUM", "HARD"].includes(q.difficulty)
        ? q.difficulty
        : "MEDIUM",
      timeLimit: typeof q.timeLimit === "number" && q.timeLimit >= 5 && q.timeLimit <= 120
        ? q.timeLimit
        : 30,
      aiLevel: typeof q.aiLevel === "number" && q.aiLevel >= 0 && q.aiLevel <= 4
        ? q.aiLevel
        : 0,
    }))

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("POST /api/ai/generate-questions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
