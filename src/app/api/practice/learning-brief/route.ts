import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkUserRateLimit } from "@/lib/rate-limiter";
import { resolveProblem } from "@/lib/problem-resolver";
import { generateLearningBrief } from "@/lib/ai-learning-brief";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = user.company?.plan || null;
    const rateCheck = checkUserRateLimit(user.id, "coaching", plan);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded", resetIn: rateCheck.resetIn },
        { status: 429 }
      );
    }

    const { bankProblemId } = await req.json();
    if (!bankProblemId) {
      return NextResponse.json({ error: "bankProblemId is required" }, { status: 400 });
    }

    const problem = resolveProblem(bankProblemId);
    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const progress = await prisma.practiceProgress.findFirst({
      where: {
        userId: user.id,
        bankProblemId,
      },
      include: {
        submissions: {
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: "No progress found for this problem yet" },
        { status: 404 }
      );
    }

    const latestSubmission = progress.submissions[0] || null;
    const brief = await generateLearningBrief({
      problem,
      code: latestSubmission?.code || progress.code,
      status: progress.status,
      timeSpentSeconds: progress.timeSpentSeconds,
      testsPassed: latestSubmission?.testsPassed || 0,
      testsTotal: latestSubmission?.testsTotal || 0,
      lastSubmissionStatus: latestSubmission?.status || null,
    });

    return NextResponse.json({ brief });
  } catch (error) {
    console.error("POST /api/practice/learning-brief error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
