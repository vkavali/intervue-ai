import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Anthropic from "@anthropic-ai/sdk"
import { checkUserRateLimit } from "@/lib/rate-limiter"

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
          error: `Interview generation limit reached (${rateCheck.limit}/day). Upgrade your plan for more.`,
          remaining: 0,
          limit: rateCheck.limit,
        },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetIn) } }
      )
    }

    const body = await req.json()
    const { prompt, role, seniority, interviewType, industry } = body

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "A prompt describing the interview is required" },
        { status: 400 }
      )
    }

    if (!role || typeof role !== "string" || role.trim().length === 0) {
      return NextResponse.json(
        { error: "Role is required to generate a relevant interview template" },
        { status: 400 }
      )
    }

    if (!interviewType || typeof interviewType !== "string" || interviewType.trim().length === 0) {
      return NextResponse.json(
        { error: "Interview type is required to generate appropriate questions" },
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
        "orderIndex": "number - 0-based question order",
        "testCases": [
          {
            "input": "string - the function call or input expression, e.g. twoSum([2,7,11,15], 9)",
            "expected": "string - the expected output as a string, e.g. [0,1]"
          }
        ],
        "starterCode": {
          "javascript": "string - JavaScript function stub",
          "python": "string - Python function stub",
          "typescript": "string - TypeScript function stub",
          "java": "string - Java method stub"
        }
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
- Questions should progress in difficulty and build on related concepts
- For each coding question, generate 3-5 test cases with clear input expressions and expected output strings. Test cases should cover normal cases, edge cases, and boundary conditions.
- For each coding question, generate starter code stubs (function signature with empty body) for javascript, python, typescript, and java. The function name must match what the test case inputs reference.
- For non-coding interview types (BEHAVIORAL, PROJECT_MANAGEMENT, BUSINESS_ANALYST), omit testCases and starterCode (set them to null or empty).
- IMPORTANT: Generate questions ONLY relevant to the specified role, interview type, and industry. Do NOT generate general knowledge, trivia, geography, history, or off-topic content.
- If the interviewType is BEHAVIORAL, PROJECT_MANAGEMENT, or BUSINESS_ANALYST, generate scenario-based and situational questions, NOT coding/algorithm questions.
- For DEVOPS interviews: generate infrastructure, CI/CD, cloud, monitoring, and deployment questions, NOT coding algorithm problems.
- For BUSINESS_ANALYST interviews: generate requirements gathering, case study, and stakeholder analysis questions, NOT algorithm problems.
- For PROJECT_MANAGEMENT interviews: generate project planning, risk management, and stakeholder scenario questions, NOT code.
- If the interviewType is SQL, generate SQL query and database design questions.
- Match questions to the specified industry when provided.
- For non-coding interview types, do NOT generate coding or algorithm questions. Generate scenario-based, analytical, or domain-specific questions appropriate for the interview type.
- For SALES interviews: generate discovery call scenarios, objection handling role-plays, pitch presentations, pipeline management questions, and negotiation scenarios. Focus on selling methodology (MEDDIC, SPIN, Challenger) and customer engagement.
- For MARKETING interviews: generate campaign strategy cases, marketing analytics interpretation, brand positioning exercises, growth marketing scenarios, and content strategy questions. Focus on ROI thinking and data-driven decision making.
- For EXECUTIVE interviews: generate leadership vision presentations, board presentation simulations, P&L analysis exercises, organizational design questions, and change management scenarios. Focus on strategic thinking and executive presence.
- For PRODUCT (Product Management) interviews: generate PRD writing exercises, feature prioritization frameworks (RICE, ICE), metrics definition and KPI analysis, user research scenario questions, and roadmap planning exercises. Focus on customer empathy and analytical rigor.
- For CUSTOMER_SUCCESS interviews: generate customer escalation handling scenarios, QBR (Quarterly Business Review) preparation exercises, churn prevention strategies, onboarding plan design, and renewal negotiation role-plays. Focus on customer relationship management and problem resolution.
- For HR interviews: generate employment policy scenario questions, conflict resolution cases, compensation analysis exercises, employee relations situations, and compliance/legal awareness questions. Focus on fairness, judgment, and people management.
- For FINANCE interviews: generate financial modeling exercises, budgeting and forecasting questions, variance analysis cases, audit scenario questions, and risk assessment exercises. Focus on analytical accuracy and financial judgment.
- For LEGAL interviews: generate contract review exercises, compliance scenario questions, regulatory analysis cases, IP protection questions, and risk mitigation strategies. Focus on legal reasoning and attention to detail.`

    const userPrompt = `Generate a complete interview template based on this description:

"${prompt}"

${role ? `Additional context - Target Role: ${role}` : ""}
${seniority ? `Additional context - Seniority Level: ${seniority}` : ""}
${interviewType ? `Additional context - Interview Type: ${interviewType}` : ""}
${industry ? `Additional context - Industry: ${industry}` : ""}`

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
          testCases?: Array<{ input: string; expected: string }> | null
          starterCode?: Record<string, string> | null
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
      interviewType: interviewType || parsed.template.roundType || "Technical",
      industry: industry || "",
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
        testCases: Array.isArray(q.testCases) && q.testCases.length > 0
          ? JSON.stringify(q.testCases)
          : null,
        starterCode: q.starterCode && typeof q.starterCode === "object"
          ? JSON.stringify(q.starterCode)
          : null,
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
