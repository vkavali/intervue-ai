import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserRateLimit } from "@/lib/rate-limiter";
import { generateCareerKit } from "@/lib/ai-career-kit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Only candidates can use the career kit" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const rateCheck = checkUserRateLimit(user.id, "coaching", null);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetIn: rateCheck.resetIn },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      targetRole,
      yearsExperience,
      backgroundSummary,
      achievements,
      currentHeadline,
      currentAbout,
      existingBullets,
      jobDescription,
    } = body;

    if (!targetRole || !backgroundSummary || !achievements) {
      return NextResponse.json(
        { error: "targetRole, backgroundSummary, and achievements are required" },
        { status: 400 }
      );
    }

    const completedPracticeCount = await prisma.practiceProgress.count({
      where: { userId: user.id, status: "COMPLETED" },
    }).catch(() => 0);

    const recentPractice = await prisma.practiceProgress.findMany({
      where: { userId: user.id, bankProblemId: { not: null } },
      select: {
        bankProblemId: true,
        status: true,
        timeSpentSeconds: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }).catch(() => []);

    const recentReports = await prisma.interviewSession.findMany({
      where: {
        candidateId: user.id,
        status: "COMPLETED",
        auditReport: { isNot: null },
      },
      select: {
        template: {
          select: {
            title: true,
            role: true,
            seniority: true,
          },
        },
        company: {
          select: {
            name: true,
          },
        },
        auditReport: {
          select: {
            overallScore: true,
            communication: true,
            codeQuality: true,
            problemComprehension: true,
            suggestedDecision: true,
          },
        },
      },
      orderBy: { endedAt: "desc" },
      take: 3,
    }).catch(() => []);

    const performanceContext = [
      `${user.name} has completed ${completedPracticeCount} practice problems to completion.`,
      recentPractice.length > 0
        ? `Recent practice: ${recentPractice
            .map((item) => `${item.bankProblemId} (${item.status}, ${Math.round(item.timeSpentSeconds / 60)} min)`)
            .join("; ")}.`
        : "No recent practice attempts found.",
      recentReports.length > 0
        ? `Recent interview reports: ${recentReports
            .map((sessionItem) => {
              const report = sessionItem.auditReport;
              return `${sessionItem.template.role} at ${sessionItem.company.name}: ${report?.overallScore?.toFixed(1) || "n/a"}/100, communication ${report?.communication?.toFixed(1) || "n/a"}, code quality ${report?.codeQuality?.toFixed(1) || "n/a"}, decision ${report?.suggestedDecision || "n/a"}`;
            })
            .join("; ")}.`
        : "No verified interview reports found yet.",
    ].join("\n");

    const kit = await generateCareerKit({
      targetRole,
      yearsExperience: yearsExperience || "",
      backgroundSummary,
      achievements,
      currentHeadline,
      currentAbout,
      existingBullets,
      jobDescription,
      performanceContext,
    });

    return NextResponse.json({ kit });
  } catch (error) {
    console.error("POST /api/candidate/career-kit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
