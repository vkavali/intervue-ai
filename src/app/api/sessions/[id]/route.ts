import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/sessions/[id] - Get session details with AI interactions, notes, and audit
export async function GET(
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
      include: {
        template: {
          include: { questions: { orderBy: { orderIndex: "asc" } } },
        },
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        aiInteractions: { orderBy: { timestamp: "asc" } },
        aiLevelOverrides: {
          orderBy: { timestamp: "asc" },
          include: {
            overriddenBy: { select: { id: true, name: true, email: true } },
          },
        },
        auditReport: true,
        interviewerNotes: {
          orderBy: { timestamp: "asc" },
          include: {
            interviewer: { select: { id: true, name: true, email: true } },
          },
        },
      },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Auto-expire if PENDING and past scheduledAt
    if (
      interviewSession.status === "PENDING" &&
      interviewSession.scheduledAt &&
      new Date(interviewSession.scheduledAt) < new Date()
    ) {
      await prisma.interviewSession.update({
        where: { id: interviewSession.id },
        data: { status: "EXPIRED" },
      })
      interviewSession.status = "EXPIRED"
    }

    // Verify the user has access to this session
    const hasAccess =
      (user.role === "COMPANY_ADMIN" &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.candidateId === user.id ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this session" },
        { status: 403 }
      )
    }

    return NextResponse.json(interviewSession)
  } catch (error) {
    console.error("GET /api/sessions/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH /api/sessions/[id] - Update session state
export async function PATCH(
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

    // Verify the user has access to modify this session
    const hasAccess =
      (user.role === "COMPANY_ADMIN" &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.candidateId === user.id ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied to this session" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { action, code, language, aiLevel, currentQuestionIndex, interviewerId: newInterviewerId } = body

    const updateData: Record<string, unknown> = {}

    // Handle action-based updates
    if (action === "start") {
      if (interviewSession.status !== "PENDING") {
        return NextResponse.json(
          { error: "Session can only be started from PENDING status" },
          { status: 400 }
        )
      }

      // Only the candidate can start the session
      if (interviewSession.candidateId !== user.id) {
        return NextResponse.json(
          { error: "Only the candidate can start the session" },
          { status: 403 }
        )
      }

      // Compute totalDurationMinutes from question time limits
      const template = await prisma.interviewTemplate.findUnique({
        where: { id: interviewSession.templateId },
        include: { questions: true },
      })
      const totalMinutes = template?.questions.reduce((sum, q) => sum + q.timeLimit, 0) || 0

      updateData.status = "ACTIVE"
      updateData.startedAt = new Date()
      updateData.totalDurationMinutes = totalMinutes > 0 ? totalMinutes : null
    } else if (action === "end") {
      if (interviewSession.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Session can only be ended from ACTIVE status" },
          { status: 400 }
        )
      }
      updateData.status = "COMPLETED"
      updateData.endedAt = new Date()
    } else if (action === "cancel") {
      if (
        interviewSession.status === "COMPLETED" ||
        interviewSession.status === "CANCELLED"
      ) {
        return NextResponse.json(
          { error: "Cannot cancel a completed or already cancelled session" },
          { status: 400 }
        )
      }
      updateData.status = "CANCELLED"
      updateData.endedAt = new Date()
    }

    // Handle field updates
    if (code !== undefined) {
      updateData.code = code
    }

    if (language !== undefined) {
      updateData.language = language
    }

    if (aiLevel !== undefined) {
      if (typeof aiLevel !== "number" || aiLevel < 0 || aiLevel > 4) {
        return NextResponse.json(
          { error: "AI level must be a number between 0 and 4" },
          { status: 400 }
        )
      }
      updateData.aiLevel = aiLevel
    }

    if (currentQuestionIndex !== undefined) {
      if (typeof currentQuestionIndex !== "number" || currentQuestionIndex < 0) {
        return NextResponse.json(
          { error: "currentQuestionIndex must be a non-negative number" },
          { status: 400 }
        )
      }
      updateData.currentQuestionIndex = currentQuestionIndex
    }

    // Handle interviewer reassignment (admin only)
    if (newInterviewerId !== undefined) {
      if (user.role !== "COMPANY_ADMIN") {
        return NextResponse.json(
          { error: "Only company admins can reassign interviewers" },
          { status: 403 }
        )
      }
      if (newInterviewerId === null) {
        updateData.interviewerId = null
      } else {
        const interviewer = await prisma.user.findUnique({
          where: { id: newInterviewerId },
        })
        if (!interviewer || (interviewer.role !== "INTERVIEWER" && interviewer.role !== "COMPANY_ADMIN")) {
          return NextResponse.json(
            { error: "Invalid interviewer" },
            { status: 400 }
          )
        }
        updateData.interviewerId = newInterviewerId
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 }
      )
    }

    const updated = await prisma.interviewSession.update({
      where: { id: params.id },
      data: updateData,
      include: {
        template: true,
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
    })

    // Create session log entries for significant actions
    const logAction = action === "start" ? "JOIN" : action === "end" ? "LEAVE" :
      code !== undefined ? "CODE_CHANGE" : language !== undefined ? "LANGUAGE_CHANGE" : null
    if (logAction) {
      prisma.sessionLog.create({
        data: {
          sessionId: params.id,
          userId: user.id,
          action: logAction,
          details: logAction === "LANGUAGE_CHANGE" ? language : undefined,
        },
      }).catch(() => {}) // Don't fail main request if logging fails
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PATCH /api/sessions/[id] error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
