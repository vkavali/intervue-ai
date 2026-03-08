import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/sessions/[id]/notes - List notes for a session
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
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Verify access - only interviewers and company admins can view notes
    const hasAccess =
      (user.role === "COMPANY_ADMIN" &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Only interviewers and company admins can view session notes" },
        { status: 403 }
      )
    }

    const notes = await prisma.interviewerNote.findMany({
      where: { sessionId: params.id },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { timestamp: "asc" },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("GET /api/sessions/[id]/notes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/sessions/[id]/notes - Add an interviewer note
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

    // Only interviewers and company admins can add notes
    if (user.role !== "INTERVIEWER" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only interviewers can add notes" },
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
        { error: "You are not authorized to add notes to this session" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { content, timestamp } = body

    if (!content) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      )
    }

    const note = await prisma.interviewerNote.create({
      data: {
        sessionId: params.id,
        interviewerId: user.id,
        content,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
      },
    })

    // Log the note addition
    prisma.sessionLog.create({
      data: {
        sessionId: params.id,
        userId: user.id,
        action: "NOTE_ADDED",
      },
    }).catch(() => {})

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions/[id]/notes error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
