import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/sessions/[id]/reinvite - Create a new session from an expired/cancelled one
export async function POST(
  _req: NextRequest,
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

    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "INTERVIEWER")) {
      return NextResponse.json(
        { error: "Only admins and interviewers can re-invite" },
        { status: 403 }
      )
    }

    const oldSession = await prisma.interviewSession.findUnique({
      where: { id: params.id },
      include: {
        template: true,
        candidate: { select: { id: true, email: true } },
      },
    })

    if (!oldSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (user.companyId !== oldSession.companyId) {
      return NextResponse.json(
        { error: "Session does not belong to your company" },
        { status: 403 }
      )
    }

    if (oldSession.status !== "EXPIRED" && oldSession.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "Can only re-invite from expired or cancelled sessions" },
        { status: 400 }
      )
    }

    const newSession = await prisma.interviewSession.create({
      data: {
        templateId: oldSession.templateId,
        companyId: oldSession.companyId,
        candidateId: oldSession.candidateId,
        interviewerId: oldSession.interviewerId,
        aiLevel: oldSession.template.defaultAiLevel,
      },
      include: {
        template: true,
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions/[id]/reinvite error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
