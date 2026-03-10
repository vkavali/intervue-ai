import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if today's challenge exists
    let challenge = await prisma.dailyChallenge.findUnique({
      where: { date: today },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            description: true,
            tags: true,
          },
        },
      },
    });

    // Auto-create if none exists: pick a random problem
    if (!challenge) {
      const problemCount = await prisma.practiceProblem.count();
      if (problemCount > 0) {
        const skip = Math.floor(Math.random() * problemCount);
        const randomProblem = await prisma.practiceProblem.findFirst({
          skip,
          select: { id: true },
        });

        if (randomProblem) {
          challenge = await prisma.dailyChallenge.create({
            data: {
              date: today,
              problemId: randomProblem.id,
              bonusXP: 50,
            },
            include: {
              problem: {
                select: {
                  id: true,
                  title: true,
                  difficulty: true,
                  description: true,
                  tags: true,
                },
              },
            },
          });
        }
      }
    }

    if (!challenge) {
      return NextResponse.json({ challenge: null });
    }

    // Check if user already completed today's challenge
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    let completed = false;
    if (user) {
      const progress = await prisma.practiceProgress.findFirst({
        where: {
          userId: user.id,
          problemId: challenge.problemId,
          status: "COMPLETED",
        },
      });
      completed = !!progress;
    }

    // Calculate time until next challenge (midnight UTC)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const timeUntilNext = tomorrow.getTime() - now.getTime();

    return NextResponse.json({
      challenge: {
        date: challenge.date,
        bonusXP: challenge.bonusXP,
        problem: challenge.problem,
        completed,
        timeUntilNextMs: timeUntilNext,
      },
    });
  } catch (error) {
    console.error("GET /api/gamification/daily-challenge error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
