import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardXP, updateStreak, checkAndAwardBadges, recordProblemSolved, DIFFICULTY_XP } from "@/lib/gamification";
import { resolveProblem } from "@/lib/problem-resolver";

// GET /api/practice/progress - Get all practice progress for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const progress = await prisma.practiceProgress.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: { lastSavedAt: "desc" },
    });

    const enrichedProgress = await Promise.all(progress.map(async (item) => {
      const resolved = item.bankProblemId ? await resolveProblem(item.bankProblemId) : null;

      return {
        ...item,
        problemTitle: resolved?.title || null,
        problemDifficulty: resolved?.difficulty || null,
        problemCategory: resolved?.category || null,
        problemPattern: resolved?.pattern || null,
        problemTags: resolved?.tags || [],
      };
    }));

    return NextResponse.json({ progress: enrichedProgress });
  } catch (error) {
    console.error("GET /api/practice/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/practice/progress - Save or update practice progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      problemId,
      bankProblemId,
      code,
      language,
      status,
      timeSpentSeconds,
      isSubmission,
      submissionStatus,
      testsPassed,
      testsTotal,
    } = body;

    if (!problemId && !bankProblemId) {
      return NextResponse.json(
        { error: "Either problemId or bankProblemId is required" },
        { status: 400 }
      );
    }

    // Validate code length
    if (code && code.length > 50000) {
      return NextResponse.json(
        { error: "Code exceeds maximum length" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["IN_PROGRESS", "COMPLETED", "ABANDONED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Upsert based on unique constraint
    const where = problemId
      ? { userId_problemId: { userId: user.id, problemId } }
      : { userId_bankProblemId: { userId: user.id, bankProblemId } };

    const data = {
      code: code || null,
      language: language || null,
      status: status || "IN_PROGRESS",
      timeSpentSeconds: timeSpentSeconds || 0,
      lastSavedAt: new Date(),
    };

    const progress = await prisma.practiceProgress.upsert({
      where,
      create: {
        userId: user.id,
        problemId: problemId || null,
        bankProblemId: bankProblemId || null,
        ...data,
      },
      update: data,
    });

    // Create submission record if this is a submission
    let submission = null;
    if (isSubmission && code && language) {
      const subStatus = submissionStatus || (status === "COMPLETED" ? "ACCEPTED" : "WRONG_ANSWER");
      submission = await prisma.practiceSubmission.create({
        data: {
          userId: user.id,
          progressId: progress.id,
          bankProblemId: bankProblemId || null,
          problemId: problemId || null,
          code,
          language,
          status: subStatus,
          testsPassed: testsPassed || 0,
          testsTotal: testsTotal || 0,
          timeSpentSeconds: timeSpentSeconds || 0,
        },
      });

      // Update bestSubmissionId if this is the best submission so far
      const currentBest = progress.bestSubmissionId
        ? await prisma.practiceSubmission.findUnique({
            where: { id: progress.bestSubmissionId },
          })
        : null;

      if (!currentBest || (testsPassed || 0) > currentBest.testsPassed) {
        await prisma.practiceProgress.update({
          where: { id: progress.id },
          data: { bestSubmissionId: submission.id },
        });
      }

      // If all tests passed on a bank problem, contribute to community
      if (subStatus === "ACCEPTED" && bankProblemId && testsPassed > 0 && testsPassed === testsTotal) {
        await prisma.communitySubmission.upsert({
          where: {
            bankProblemId_userId_language: {
              bankProblemId,
              userId: user.id,
              language,
            },
          },
          create: {
            bankProblemId,
            userId: user.id,
            code,
            language,
          },
          update: {
            code,
          },
        });
      }
    }

    // ─── Gamification hooks ──────────────────────────────────────────────────
    let gamification = null;
    if (isSubmission && submissionStatus === "ACCEPTED" && status === "COMPLETED") {
      try {
        // Determine difficulty for XP
        let difficulty = "EASY";
        if (problemId) {
          const prob = await prisma.practiceProblem.findUnique({
            where: { id: problemId },
            select: { difficulty: true },
          });
          if (prob) difficulty = prob.difficulty;
        }

        const xpAmount = DIFFICULTY_XP[difficulty] || 10;
        const xpResult = await awardXP(user.id, xpAmount, "PROBLEM_SOLVED", progress.id);
        const streakResult = await updateStreak(user.id);
        await recordProblemSolved(user.id);
        const newBadges = await checkAndAwardBadges(user.id);

        gamification = {
          xpAwarded: xpAmount,
          newXP: xpResult.newXP,
          newLevel: xpResult.newLevel,
          leveledUp: xpResult.leveledUp,
          streak: streakResult.currentStreak,
          streakRecord: streakResult.newRecord,
          streakMilestone: streakResult.milestoneHit,
          newBadges,
        };
      } catch (err) {
        console.error("Gamification hook error (non-fatal):", err);
      }
    }

    return NextResponse.json({ progress, submission, gamification });
  } catch (error) {
    console.error("POST /api/practice/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
