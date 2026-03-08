import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/sessions/[id]/chat - Get all chat messages for session
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

    // Verify participation
    const isParticipant =
      interviewSession.candidateId === user.id ||
      interviewSession.interviewerId === user.id ||
      (user.role === "COMPANY_ADMIN" && user.companyId === interviewSession.companyId)

    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId: params.id },
      orderBy: { timestamp: "asc" },
      include: {
        sender: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error("GET /api/sessions/[id]/chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/sessions/[id]/chat - Send a chat message
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
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Verify participation
    const isParticipant =
      interviewSession.candidateId === user.id ||
      interviewSession.interviewerId === user.id ||
      (user.role === "COMPANY_ADMIN" && user.companyId === interviewSession.companyId)

    if (!isParticipant) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await req.json()
    const { content } = body

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 })
    }

    const message = await prisma.chatMessage.create({
      data: {
        sessionId: params.id,
        senderId: user.id,
        content: content.trim(),
      },
      include: {
        sender: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("POST /api/sessions/[id]/chat error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
