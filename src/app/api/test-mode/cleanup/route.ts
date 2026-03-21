import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEMO_DOMAIN = "@test.invalid";

export async function POST(req: NextRequest) {
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

    // Find all demo users
    const demoUsers = await prisma.user.findMany({
      where: { email: { endsWith: DEMO_DOMAIN } },
      select: { id: true },
    });
    const demoUserIds = demoUsers.map((u) => u.id);

    if (demoUserIds.length === 0) {
      return NextResponse.json({ message: "No demo data to clean up", deleted: false });
    }

    // Find demo company (by slug)
    const demoCompany = await prisma.company.findUnique({
      where: { slug: "demo-corp" },
      select: { id: true },
    });
    const demoCompanyId = demoCompany?.id;

    // Find all demo sessions
    const demoSessions = await prisma.interviewSession.findMany({
      where: { candidateId: { in: demoUserIds } },
      select: { id: true },
    });
    const demoSessionIds = demoSessions.map((s) => s.id);

    // Find demo practice problems
    const demoProblems = await prisma.practiceProblem.findMany({
      where: { userId: { in: demoUserIds } },
      select: { id: true },
    });
    const demoProblemIds = demoProblems.map((p) => p.id);

    // Find demo practice progress
    const demoProgress = await prisma.practiceProgress.findMany({
      where: { userId: { in: demoUserIds } },
      select: { id: true },
    });
    const demoProgressIds = demoProgress.map((p) => p.id);

    // Find demo positions
    const demoPositionIds: string[] = [];
    if (demoCompanyId) {
      const positions = await prisma.openPosition.findMany({
        where: { companyId: demoCompanyId },
        select: { id: true },
      });
      demoPositionIds.push(...positions.map((p) => p.id));
    }

    // Delete in dependency order (deepest children first) using a transaction
    await prisma.$transaction([
      // Session children
      prisma.codeSnapshot.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.interviewerNote.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.violation.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.sessionLog.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.chatMessage.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.aIInteraction.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.aILevelOverride.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.auditReport.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),
      prisma.thinkingAnalysis.deleteMany({ where: { sessionId: { in: demoSessionIds } } }),

      // Sessions
      prisma.interviewSession.deleteMany({ where: { id: { in: demoSessionIds } } }),

      // Template children + templates
      ...(demoCompanyId
        ? [
            prisma.question.deleteMany({
              where: { template: { companyId: demoCompanyId } },
            }),
            prisma.interviewTemplate.deleteMany({ where: { companyId: demoCompanyId } }),
          ]
        : []),

      // Practice: submissions -> progress -> problems
      prisma.practiceSubmission.deleteMany({ where: { progressId: { in: demoProgressIds } } }),
      prisma.practiceProgress.deleteMany({ where: { id: { in: demoProgressIds } } }),
      // Daily challenges referencing demo problems
      prisma.dailyChallenge.deleteMany({ where: { problemId: { in: demoProblemIds } } }),
      prisma.practiceProblem.deleteMany({ where: { id: { in: demoProblemIds } } }),

      // Gamification
      prisma.userBadge.deleteMany({ where: { userId: { in: demoUserIds } } }),
      prisma.xPTransaction.deleteMany({ where: { userId: { in: demoUserIds } } }),
      prisma.dailyActivity.deleteMany({ where: { userId: { in: demoUserIds } } }),

      // User-related
      prisma.notification.deleteMany({ where: { userId: { in: demoUserIds } } }),
      prisma.weaknessProfile.deleteMany({ where: { userId: { in: demoUserIds } } }),

      // Pipeline
      ...(demoCompanyId
        ? [prisma.candidatePipeline.deleteMany({ where: { companyId: demoCompanyId } })]
        : []),

      // Jobs: applications -> positions
      ...(demoPositionIds.length > 0
        ? [
            prisma.jobApplication.deleteMany({ where: { positionId: { in: demoPositionIds } } }),
            prisma.openPosition.deleteMany({ where: { id: { in: demoPositionIds } } }),
          ]
        : []),

      // Company children
      ...(demoCompanyId
        ? [prisma.hiringComparison.deleteMany({ where: { companyId: demoCompanyId } })]
        : []),

      // Users
      prisma.user.deleteMany({ where: { id: { in: demoUserIds } } }),

      // Company
      ...(demoCompanyId ? [prisma.company.delete({ where: { id: demoCompanyId } })] : []),
    ]);

    // Restore original role if cookie is present
    const originalRole = req.cookies.get("demo-original-role")?.value;
    const response = NextResponse.json({
      success: true,
      message: "Demo data cleaned up successfully",
      deletedUsers: demoUserIds.length,
      deletedSessions: demoSessionIds.length,
    });

    // Clear the demo mode cookies
    response.cookies.set("demo-mode", "", { maxAge: 0, path: "/" });
    response.cookies.set("demo-original-role", "", { maxAge: 0, path: "/" });

    // If user had an original role stored, restore it
    if (originalRole && session.user.id) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { role: originalRole },
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/test-mode/cleanup error:", error);
    return NextResponse.json(
      { error: "Failed to clean up demo data", details: String(error) },
      { status: 500 }
    );
  }
}
