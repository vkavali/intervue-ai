import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAIResponse } from "@/lib/ai-levels"
import { checkUserRateLimit } from "@/lib/rate-limiter"
import { validateAIPrompt } from "@/lib/ai-prompt-validator"

// POST /api/sessions/[id]/ai - AI assist endpoint
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Rate limit check
    const plan = user.company?.plan || null
    const rateCheck = checkUserRateLimit(user.id, "aiCalls", plan)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `AI usage limit reached. You have used all ${rateCheck.limit} AI calls for today. Resets in ${Math.ceil(rateCheck.resetIn / 3600)} hours.`,
          remaining: 0,
          limit: rateCheck.limit,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateCheck.resetIn) },
        }
      )
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: params.id },
      include: { template: { select: { interviewType: true } } },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Verify the user is a participant in this session
    const isParticipant =
      interviewSession.candidateId === user.id ||
      interviewSession.interviewerId === user.id

    if (!isParticipant) {
      return NextResponse.json(
        { error: "Access denied to this session" },
        { status: 403 }
      )
    }

    if (interviewSession.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "AI assist is only available during active sessions" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { prompt, code, questionContext } = body

    // Validate prompt
    const validation = validateAIPrompt({ prompt, code, questionContext })
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const currentAiLevel = interviewSession.aiLevel

    // L0: AI assistance is locked
    if (currentAiLevel === 0) {
      const interaction = await prisma.aIInteraction.create({
        data: {
          sessionId: params.id,
          prompt: validation.sanitizedPrompt!,
          response: "AI assistance is locked for this session (Level 0).",
          aiLevel: currentAiLevel,
        },
      })

      return NextResponse.json({
        response: "AI assistance is locked for this session (Level 0).",
        aiLevel: currentAiLevel,
        interactionId: interaction.id,
        remaining: rateCheck.remaining,
      })
    }

    // Get AI response based on current level
    const aiResponse = await getAIResponse({
      level: currentAiLevel,
      prompt: validation.sanitizedPrompt!,
      code: validation.sanitizedCode ?? "",
      questionContext: validation.sanitizedContext ?? "",
      interviewType: interviewSession.template?.interviewType,
    })

    // Save the interaction
    const interaction = await prisma.aIInteraction.create({
      data: {
        sessionId: params.id,
        prompt: validation.sanitizedPrompt!,
        response: aiResponse,
        aiLevel: currentAiLevel,
      },
    })

    // Log AI request
    prisma.sessionLog.create({
      data: {
        sessionId: params.id,
        userId: user.id,
        action: "AI_REQUEST",
        details: `Level ${currentAiLevel}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      response: aiResponse,
      aiLevel: currentAiLevel,
      interactionId: interaction.id,
      remaining: rateCheck.remaining,
      limit: rateCheck.limit,
    })
  } catch (error) {
    console.error("POST /api/sessions/[id]/ai error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
