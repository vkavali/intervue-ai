import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateAuditReport } from "@/lib/ai-audit"

// GET /api/sessions/[id]/audit - Get existing audit report
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
      include: { auditReport: true },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Verify access
    const hasAccess =
      (user.role === "COMPANY_ADMIN" &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Only interviewers and company admins can view audit reports" },
        { status: 403 }
      )
    }

    if (!interviewSession.auditReport) {
      return NextResponse.json(
        { error: "No audit report found for this session" },
        { status: 404 }
      )
    }

    return NextResponse.json(interviewSession.auditReport)
  } catch (error) {
    console.error("GET /api/sessions/[id]/audit error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST /api/sessions/[id]/audit - Generate audit report for a completed session
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

    // Only interviewers and company admins can generate audit reports
    if (user.role !== "INTERVIEWER" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only interviewers and company admins can generate audit reports" },
        { status: 403 }
      )
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
        aiLevelOverrides: { orderBy: { timestamp: "asc" } },
        interviewerNotes: { orderBy: { timestamp: "asc" } },
        auditReport: true,
      },
    })

    if (!interviewSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      )
    }

    // Verify access
    const hasAccess =
      (user.role === "COMPANY_ADMIN" &&
        user.companyId === interviewSession.companyId) ||
      interviewSession.interviewerId === user.id

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You are not authorized to generate an audit report for this session" },
        { status: 403 }
      )
    }

    if (interviewSession.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Audit reports can only be generated for completed sessions" },
        { status: 400 }
      )
    }

    // Check if an audit report already exists
    if (interviewSession.auditReport) {
      return NextResponse.json(
        { error: "An audit report already exists for this session. Delete it first to regenerate." },
        { status: 409 }
      )
    }

    // Generate the audit report
    const reportData = await generateAuditReport({
      session: interviewSession,
      questions: interviewSession.template.questions,
      aiInteractions: interviewSession.aiInteractions,
      aiLevelOverrides: interviewSession.aiLevelOverrides,
      interviewerNotes: interviewSession.interviewerNotes,
      code: interviewSession.code ?? "",
      language: interviewSession.language ?? "unknown",
    })

    // Save the audit report
    const auditReport = await prisma.auditReport.create({
      data: {
        sessionId: params.id,
        overallScore: reportData.overallScore,
        problemComprehension: reportData.problemComprehension,
        solutionCorrectness: reportData.solutionCorrectness,
        codeQuality: reportData.codeQuality,
        communication: reportData.communication,
        aiUsageQuality: reportData.aiUsageQuality,
        timeManagement: reportData.timeManagement,
        thinkingTrace: reportData.thinkingTrace,
        riskFlags: JSON.stringify(reportData.riskFlags),
        quoteHighlights: JSON.stringify(reportData.quoteHighlights),
        suggestedDecision: reportData.suggestedDecision,
        confidence: reportData.confidence,
        reasoning: reportData.reasoning,
      },
    })

    return NextResponse.json(auditReport, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions/[id]/audit error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
