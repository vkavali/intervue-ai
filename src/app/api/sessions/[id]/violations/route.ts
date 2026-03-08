import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/sessions/[id]/violations - Get all violations for a session
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
    })
    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Only interviewer, admin, or the candidate can see violations
    const hasAccess =
      interviewSession.candidateId === user.id ||
      interviewSession.interviewerId === user.id ||
      (user.role === "COMPANY_ADMIN" && user.companyId === interviewSession.companyId)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const violations = await prisma.violation.findMany({
      where: { sessionId: params.id },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(violations)
  } catch (error) {
    console.error("GET /api/sessions/[id]/violations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/sessions/[id]/violations - Log a session violation
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

    const sessionId = params.id
    const body = await req.json()
    const { type, timestamp, details } = body

    // Persist violation to database
    const violation = await prisma.violation.create({
      data: {
        sessionId,
        userId: user.id,
        type: type || "UNKNOWN",
        details: details || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    })

    // Create session log entry
    await prisma.sessionLog.create({
      data: {
        sessionId,
        userId: user.id,
        action: "VIOLATION",
        details: JSON.stringify({ type, details }),
      },
    }).catch(() => {}) // Don't fail if log creation fails

    // Create notification for interviewer
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      select: { interviewerId: true },
    })

    if (interviewSession?.interviewerId) {
      await prisma.notification.create({
        data: {
          userId: interviewSession.interviewerId,
          type: "SYSTEM",
          title: "Violation Detected",
          message: `${type.replace(/_/g, " ")} detected in session`,
          link: `/session/${sessionId}/watch`,
        },
      }).catch(() => {}) // Don't fail if notification creation fails
    }

    console.log(
      `[VIOLATION] Session: ${sessionId}, User: ${session.user.email}, Type: ${type}, Time: ${timestamp}`
    )

    return NextResponse.json(violation)
  } catch (error) {
    console.error("Violation log error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
