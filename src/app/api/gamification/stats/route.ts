import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLevel, xpProgressInLevel } from "@/lib/gamification";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get badges
    const badges = await prisma.userBadge.findMany({
      where: { userId: user.id },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });

    // Get heatmap data (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const startDate = oneYearAgo.toISOString().split("T")[0];

    const heatmap = await prisma.dailyActivity.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate },
      },
      orderBy: { date: "asc" },
    });

    // Get problems solved count
    const problemsSolved = await prisma.practiceProgress.count({
      where: { userId: user.id, status: "COMPLETED" },
    });

    // Get global rank
    const rank = await prisma.user.count({
      where: { xp: { gt: user.xp }, role: "CANDIDATE" },
    });

    const progress = xpProgressInLevel(user.xp);

    return NextResponse.json({
      xp: user.xp,
      level: getLevel(user.xp),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      xpProgress: progress,
      badges: badges.map((b) => ({
        slug: b.badge.slug,
        name: b.badge.name,
        description: b.badge.description,
        icon: b.badge.icon,
        category: b.badge.category,
        earnedAt: b.earnedAt,
      })),
      heatmap: heatmap.map((h) => ({
        date: h.date,
        problems: h.problems,
        xpEarned: h.xpEarned,
      })),
      problemsSolved,
      globalRank: rank + 1,
    });
  } catch (error) {
    console.error("GET /api/gamification/stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
