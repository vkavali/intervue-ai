import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/sessions/[id]/override - Interviewer overrides AI level
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

    // Only interviewers (or company admins acting as interviewers) can override
    if (user.role !== "INTERVIEWER" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only interviewers can override AI levels" },
        { status: 403 }
      )
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

    // Verify the user is the interviewer for this session or a company admin
    const isAuthorized =
      interviewSession.interviewerId === user.id ||
      (user.role === "COMPANY_ADMIN" &&
        user.companyId === interviewSession.companyId)

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "You are not authorized to override AI level for this session" },
        { status: 403 }
      )
    }

    if (interviewSession.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "AI level can only be overridden during active sessions" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { newLevel, reason } = body

    if (newLevel === undefined || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: newLevel, reason" },
        { status: 400 }
      )
    }

    if (typeof newLevel !== "number" || newLevel < 0 || newLevel > 4) {
      return NextResponse.json(
        { error: "newLevel must be a number between 0 and 4" },
        { status: 400 }
      )
    }

    const previousLevel = interviewSession.aiLevel

    if (previousLevel === newLevel) {
      return NextResponse.json(
        { error: "New AI level is the same as the current level" },
        { status: 400 }
      )
    }

    // Create the override record and update the session in a transaction
    const [override, updatedSession] = await prisma.$transaction([
      prisma.aILevelOverride.create({
        data: {
          sessionId: params.id,
          previousLevel,
          newLevel,
          reason,
          overriddenById: user.id,
        },
      }),
      prisma.interviewSession.update({
        where: { id: params.id },
        data: { aiLevel: newLevel },
        include: {
          template: true,
          candidate: { select: { id: true, name: true, email: true } },
          interviewer: { select: { id: true, name: true, email: true } },
        },
      }),
    ])

    // Log the override
    prisma.sessionLog.create({
      data: {
        sessionId: params.id,
        userId: user.id,
        action: "OVERRIDE",
        details: `AI level ${previousLevel} -> ${newLevel}: ${reason}`,
      },
    }).catch(() => {})

    return NextResponse.json({
      override,
      session: updatedSession,
      message: `AI level changed from ${previousLevel} to ${newLevel}`,
    })
  } catch (error) {
    console.error("POST /api/sessions/[id]/override error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
