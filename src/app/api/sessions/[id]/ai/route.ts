import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getAIResponse } from "@/lib/ai-levels"

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
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: params.id },
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

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    const currentAiLevel = interviewSession.aiLevel

    // L0: AI assistance is locked
    if (currentAiLevel === 0) {
      const interaction = await prisma.aIInteraction.create({
        data: {
          sessionId: params.id,
          prompt,
          response: "AI assistance is locked for this session (Level 0).",
          aiLevel: currentAiLevel,
        },
      })

      return NextResponse.json({
        response: "AI assistance is locked for this session (Level 0).",
        aiLevel: currentAiLevel,
        interactionId: interaction.id,
      })
    }

    // Get AI response based on current level
    const aiResponse = await getAIResponse({
      level: currentAiLevel,
      prompt,
      code: code ?? "",
      questionContext: questionContext ?? "",
    })

    // Save the interaction
    const interaction = await prisma.aIInteraction.create({
      data: {
        sessionId: params.id,
        prompt,
        response: aiResponse,
        aiLevel: currentAiLevel,
      },
    })

    return NextResponse.json({
      response: aiResponse,
      aiLevel: currentAiLevel,
      interactionId: interaction.id,
    })
  } catch (error) {
    console.error("POST /api/sessions/[id]/ai error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
