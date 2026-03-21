import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEMO_DOMAIN = "@test.invalid";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testModeEmail = process.env.TEST_MODE_EMAIL;
    if (testModeEmail) {
      if (session.user.email !== testModeEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.count({ where: { email: { endsWith: DEMO_DOMAIN } } });

    if (users === 0) {
      return NextResponse.json({ seeded: false, counts: {} });
    }

    const demoUserIds = (
      await prisma.user.findMany({
        where: { email: { endsWith: DEMO_DOMAIN } },
        select: { id: true },
      })
    ).map((u) => u.id);

    const demoCompany = await prisma.company.findUnique({ where: { slug: "demo-corp" } });
    const companyId = demoCompany?.id;

    const [
      sessions,
      templates,
      auditReports,
      aiInteractions,
      positions,
      applications,
      pipelines,
      practiceProblems,
      practiceProgress,
      submissions,
      userBadges,
      xpTransactions,
      dailyActivity,
      chatMessages,
      sessionLogs,
      violations,
      interviewerNotes,
      codeSnapshots,
      notifications,
    ] = await Promise.all([
      prisma.interviewSession.count({ where: { candidateId: { in: demoUserIds } } }),
      companyId ? prisma.interviewTemplate.count({ where: { companyId } }) : 0,
      prisma.auditReport.count({ where: { session: { candidateId: { in: demoUserIds } } } }),
      prisma.aIInteraction.count({ where: { session: { candidateId: { in: demoUserIds } } } }),
      companyId ? prisma.openPosition.count({ where: { companyId } }) : 0,
      companyId
        ? prisma.jobApplication.count({ where: { position: { companyId } } })
        : 0,
      companyId ? prisma.candidatePipeline.count({ where: { companyId } }) : 0,
      prisma.practiceProblem.count({ where: { userId: { in: demoUserIds } } }),
      prisma.practiceProgress.count({ where: { userId: { in: demoUserIds } } }),
      prisma.practiceSubmission.count({ where: { userId: { in: demoUserIds } } }),
      prisma.userBadge.count({ where: { userId: { in: demoUserIds } } }),
      prisma.xPTransaction.count({ where: { userId: { in: demoUserIds } } }),
      prisma.dailyActivity.count({ where: { userId: { in: demoUserIds } } }),
      prisma.chatMessage.count({ where: { session: { candidateId: { in: demoUserIds } } } }),
      prisma.sessionLog.count({ where: { session: { candidateId: { in: demoUserIds } } } }),
      prisma.violation.count({ where: { userId: { in: demoUserIds } } }),
      prisma.interviewerNote.count({ where: { session: { candidateId: { in: demoUserIds } } } }),
      prisma.codeSnapshot.count({ where: { session: { candidateId: { in: demoUserIds } } } }),
      prisma.notification.count({ where: { userId: { in: demoUserIds } } }),
    ]);

    return NextResponse.json({
      seeded: true,
      counts: {
        users,
        sessions,
        templates,
        auditReports,
        aiInteractions,
        positions,
        applications,
        pipelines,
        practiceProblems,
        practiceProgress,
        submissions,
        userBadges,
        xpTransactions,
        dailyActivity,
        chatMessages,
        sessionLogs,
        violations,
        interviewerNotes,
        codeSnapshots,
        notifications,
      },
    });
  } catch (error) {
    console.error("GET /api/test-mode/status error:", error);
    return NextResponse.json(
      { error: "Failed to get status", details: String(error) },
      { status: 500 }
    );
  }
}
