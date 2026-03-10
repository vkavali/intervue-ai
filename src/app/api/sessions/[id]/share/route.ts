import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateShareToken } from "@/lib/share-token"

// POST /api/sessions/[id]/share - Generate share token for candidate's own session
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
      include: { auditReport: true },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Only the candidate who owns this session can share it
    if (interviewSession.candidateId !== user.id) {
      return NextResponse.json(
        { error: "Only the candidate can share their own session" },
        { status: 403 }
      )
    }

    if (!interviewSession.auditReport) {
      return NextResponse.json(
        { error: "No audit report available to share" },
        { status: 400 }
      )
    }

    // Return existing token if already generated
    if (interviewSession.auditReport.shareToken) {
      return NextResponse.json({ shareToken: interviewSession.auditReport.shareToken })
    }

    // Generate and save new token
    const shareToken = generateShareToken()
    await prisma.auditReport.update({
      where: { id: interviewSession.auditReport.id },
      data: { shareToken },
    })

    return NextResponse.json({ shareToken }, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions/[id]/share error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/sessions/[id]/share - Revoke share token
export async function DELETE(
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
      include: { auditReport: true },
    })

    if (!interviewSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (interviewSession.candidateId !== user.id) {
      return NextResponse.json(
        { error: "Only the candidate can revoke their share token" },
        { status: 403 }
      )
    }

    if (!interviewSession.auditReport) {
      return NextResponse.json({ error: "No audit report found" }, { status: 404 })
    }

    await prisma.auditReport.update({
      where: { id: interviewSession.auditReport.id },
      data: { shareToken: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/sessions/[id]/share error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
