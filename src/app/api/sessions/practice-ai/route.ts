import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAIResponse } from "@/lib/ai-levels"
import { checkUserRateLimit } from "@/lib/rate-limiter"
import { validateAIPrompt } from "@/lib/ai-prompt-validator"

// POST /api/sessions/practice-ai - AI endpoint for practice mode
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Rate limit check - use user ID if logged in, otherwise restrict more
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

    const rateCheck = checkUserRateLimit(userId, "practiceAi", plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Practice AI limit reached (${rateCheck.limit}/day). ${session?.user ? "Upgrade your plan for more." : "Sign in for more AI calls."}`,
          remaining: 0,
          limit: rateCheck.limit,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.resetIn) },
        }
      )
    }

    const body = await req.json()
    const { prompt, code, questionContext, aiLevel } = body

    // Validate prompt
    const validation = validateAIPrompt({ prompt, code, questionContext })
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    if (typeof aiLevel !== "number" || aiLevel < 0 || aiLevel > 4) {
      return NextResponse.json(
        { error: "aiLevel must be a number between 0 and 4" },
        { status: 400 }
      )
    }

    // Level 0 means AI is locked
    if (aiLevel === 0) {
      return NextResponse.json({
        response:
          "AI assistance is locked. Please select a higher AI level to get help.",
        remaining: rateCheck.remaining,
      })
    }

    // Call the shared AI response function
    const response = await getAIResponse({
      level: aiLevel,
      prompt: validation.sanitizedPrompt!,
      code: validation.sanitizedCode || "",
      questionContext: validation.sanitizedContext || "",
    })

    return NextResponse.json({
      response,
      remaining: rateCheck.remaining,
      limit: rateCheck.limit,
    })
  } catch (error) {
    console.error("POST /api/sessions/practice-ai error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
