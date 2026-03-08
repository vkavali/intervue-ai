import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/sessions/[id]/logs - Get all session log entries
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

    // Only interviewer or admin can see logs
    const hasAccess =
      interviewSession.interviewerId === user.id ||
      (user.role === "COMPANY_ADMIN" && user.companyId === interviewSession.companyId)

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Filter by action type if provided
    const { searchParams } = new URL(req.url)
    const actionFilter = searchParams.get("action")

    const logs = await prisma.sessionLog.findMany({
      where: {
        sessionId: params.id,
        ...(actionFilter ? { action: actionFilter } : {}),
      },
      orderBy: { timestamp: "asc" },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error("GET /api/sessions/[id]/logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
