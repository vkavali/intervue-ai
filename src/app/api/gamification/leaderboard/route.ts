import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = (page - 1) * limit;

    // For weekly/monthly, filter by XP earned in period
    let dateFilter: string | undefined;
    if (period === "weekly") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      dateFilter = d.toISOString().split("T")[0];
    } else if (period === "monthly") {
      const d = new Date();
      d.setMonth(d.getMonth() - 1);
      dateFilter = d.toISOString().split("T")[0];
    }

    if (dateFilter) {
      // Get XP earned in period from daily activities
      const activities = await prisma.dailyActivity.groupBy({
        by: ["userId"],
        where: { date: { gte: dateFilter } },
        _sum: { xpEarned: true },
        orderBy: { _sum: { xpEarned: "desc" } },
        skip: offset,
        take: limit,
      });

      const userIds = activities.map((a) => a.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds }, role: "CANDIDATE", profilePublic: true },
        select: {
          id: true,
          name: true,
          xp: true,
          level: true,
          currentStreak: true,
          _count: { select: { practiceProgress: { where: { status: "COMPLETED" } } } },
        },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));
      const leaderboard = activities
        .map((a, i) => {
          const user = userMap.get(a.userId);
          if (!user) return null;
          return {
            rank: offset + i + 1,
            userId: user.id,
            name: user.name,
            level: user.level,
            xp: user.xp,
            periodXP: a._sum.xpEarned || 0,
            streak: user.currentStreak,
            problemsSolved: user._count.practiceProgress,
          };
        })
        .filter(Boolean);

      // Get current user's rank in period
      const currentUserActivity = await prisma.dailyActivity.groupBy({
        by: ["userId"],
        where: { date: { gte: dateFilter }, userId: session.user.id },
        _sum: { xpEarned: true },
      });

      const currentUserPeriodXP = currentUserActivity[0]?._sum.xpEarned || 0;
      const higherCount = await prisma.dailyActivity.groupBy({
        by: ["userId"],
        where: { date: { gte: dateFilter } },
        _sum: { xpEarned: true },
        having: { xpEarned: { _sum: { gt: currentUserPeriodXP } } },
      });

      return NextResponse.json({
        leaderboard,
        currentUserRank: higherCount.length + 1,
        page,
        limit,
      });
    }

    // All-time leaderboard (sorted by total XP)
    const users = await prisma.user.findMany({
      where: { role: "CANDIDATE", profilePublic: true },
      select: {
        id: true,
        name: true,
        xp: true,
        level: true,
        currentStreak: true,
        _count: { select: { practiceProgress: { where: { status: "COMPLETED" } } } },
      },
      orderBy: { xp: "desc" },
      skip: offset,
      take: limit,
    });

    const leaderboard = users.map((user, i) => ({
      rank: offset + i + 1,
      userId: user.id,
      name: user.name,
      level: user.level,
      xp: user.xp,
      periodXP: user.xp,
      streak: user.currentStreak,
      problemsSolved: user._count.practiceProgress,
    }));

    // Current user's rank
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    });
    const currentUserRank = currentUser
      ? (await prisma.user.count({
          where: { xp: { gt: currentUser.xp }, role: "CANDIDATE" },
        })) + 1
      : 0;

    const total = await prisma.user.count({ where: { role: "CANDIDATE", profilePublic: true } });

    return NextResponse.json({
      leaderboard,
      currentUserRank,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/gamification/leaderboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
