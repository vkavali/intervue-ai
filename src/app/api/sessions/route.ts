import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"

// GET /api/sessions - List interview sessions for the user
export async function GET(_req: NextRequest) {
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

    // Auto-expire PENDING sessions whose scheduledAt has passed
    const expireFilter: Record<string, unknown> = {
      status: "PENDING",
      scheduledAt: { not: null, lt: new Date() },
    }
    if (user.role === "COMPANY_ADMIN" && user.companyId) {
      expireFilter.companyId = user.companyId
    } else if (user.role === "INTERVIEWER") {
      expireFilter.interviewerId = user.id
    } else if (user.role === "CANDIDATE") {
      expireFilter.candidateId = user.id
    }
    await prisma.interviewSession.updateMany({
      where: expireFilter,
      data: { status: "EXPIRED" },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sessions: any[]

    if (user.role === "COMPANY_ADMIN" && user.companyId) {
      // Admins see all sessions for their company
      sessions = await prisma.interviewSession.findMany({
        where: { companyId: user.companyId },
        include: {
          template: true,
          candidate: { select: { id: true, name: true, email: true } },
          interviewer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (user.role === "INTERVIEWER") {
      // Interviewers see sessions they are assigned to
      sessions = await prisma.interviewSession.findMany({
        where: { interviewerId: user.id },
        include: {
          template: true,
          candidate: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (user.role === "CANDIDATE") {
      // Candidates see their own sessions
      sessions = await prisma.interviewSession.findMany({
        where: { candidateId: user.id },
        include: {
          template: true,
          interviewer: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    } else {
      sessions = []
    }

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("GET /api/sessions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/sessions - Create a new interview session from a template
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user || !user.companyId) {
      return NextResponse.json(
        { error: "User not associated with a company" },
        { status: 403 }
      )
    }

    if (user.role !== "COMPANY_ADMIN" && user.role !== "INTERVIEWER") {
      return NextResponse.json(
        { error: "Only company admins and interviewers can create sessions" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { templateId, candidateEmail: rawCandidateEmail, interviewerEmail: rawInterviewerEmail, scheduledAt } = body
    const candidateEmail = rawCandidateEmail?.toLowerCase().trim()
    const interviewerEmail = rawInterviewerEmail?.toLowerCase().trim()

    if (!templateId || !candidateEmail) {
      return NextResponse.json(
        { error: "Missing required fields: templateId, candidateEmail" },
        { status: 400 }
      )
    }

    // Verify template belongs to user's company
    const template = await prisma.interviewTemplate.findUnique({
      where: { id: templateId },
    })

    if (!template) {
      return NextResponse.json(
        { error: "Interview template not found" },
        { status: 404 }
      )
    }

    if (template.companyId !== user.companyId) {
      return NextResponse.json(
        { error: "Template does not belong to your company" },
        { status: 403 }
      )
    }

    // Find or create the candidate user
    let candidate = await prisma.user.findUnique({
      where: { email: candidateEmail },
    })

    if (!candidate) {
      candidate = await prisma.user.create({
        data: {
          email: candidateEmail,
          name: candidateEmail.split("@")[0],
          password: "",
          role: "CANDIDATE",
        },
      })
    }

    // Find the interviewer if provided
    let interviewerId: string | null = null
    if (interviewerEmail) {
      const interviewer = await prisma.user.findUnique({
        where: { email: interviewerEmail },
      })

      if (!interviewer) {
        return NextResponse.json(
          { error: "Interviewer not found" },
          { status: 404 }
        )
      }

      if (
        interviewer.role !== "INTERVIEWER" &&
        interviewer.role !== "COMPANY_ADMIN"
      ) {
        return NextResponse.json(
          { error: "Specified user is not an interviewer" },
          { status: 400 }
        )
      }

      interviewerId = interviewer.id
    }

    // Generate a unique session link token
    const sessionLink = uuidv4()

    const interviewSession = await prisma.interviewSession.create({
      data: {
        templateId,
        companyId: user.companyId,
        candidateId: candidate.id,
        interviewerId,
        aiLevel: template.defaultAiLevel,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: {
        template: true,
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(
      {
        ...interviewSession,
        sessionLink: `/session/${interviewSession.id}?token=${sessionLink}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("POST /api/sessions error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
