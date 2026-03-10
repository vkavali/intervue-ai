import { prisma } from "@/lib/prisma";

// ─── XP Constants ──────────────────────────────────────────────────────────────

export const XP_VALUES = {
  EASY_SOLVED: 10,
  MEDIUM_SOLVED: 25,
  HARD_SOLVED: 50,
  DAILY_LOGIN: 5,
  STREAK_7_BONUS: 50,
  STREAK_30_BONUS: 200,
  DAILY_CHALLENGE: 50,
  BADGE_EARNED: 25,
} as const;

export const DIFFICULTY_XP: Record<string, number> = {
  EASY: XP_VALUES.EASY_SOLVED,
  MEDIUM: XP_VALUES.MEDIUM_SOLVED,
  HARD: XP_VALUES.HARD_SOLVED,
};

// ─── Level Calculation ─────────────────────────────────────────────────────────

export function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

export function xpProgressInLevel(xp: number): { current: number; needed: number; percentage: number } {
  const level = getLevel(xp);
  const currentLevelXP = (level - 1) * (level - 1) * 100;
  const nextLevelXP = level * level * 100;
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  return { current, needed, percentage: Math.min((current / needed) * 100, 100) };
}

// ─── Award XP ──────────────────────────────────────────────────────────────────

export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  sourceId?: string
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  // Create XP transaction
  await prisma.xPTransaction.create({
    data: { userId, amount, reason, sourceId },
  });

  // Update user XP
  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: amount } },
  });

  const newLevel = getLevel(user.xp);
  const leveledUp = newLevel > getLevel(user.xp - amount);

  if (newLevel !== user.level) {
    await prisma.user.update({
      where: { id: userId },
      data: { level: newLevel },
    });
  }

  // Upsert daily activity
  const today = new Date().toISOString().split("T")[0];
  await prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, xpEarned: amount },
    update: { xpEarned: { increment: amount } },
  });

  return { newXP: user.xp, newLevel, leveledUp };
}

// ─── Update Streak ─────────────────────────────────────────────────────────────

export async function updateStreak(
  userId: string
): Promise<{ currentStreak: number; newRecord: boolean; milestoneHit: number | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  if (!user) return { currentStreak: 0, newRecord: false, milestoneHit: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (lastActive) lastActive.setHours(0, 0, 0, 0);

  let newStreak = user.currentStreak;

  if (!lastActive) {
    // First activity ever
    newStreak = 1;
  } else {
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      // Already active today, no change
      return { currentStreak: user.currentStreak, newRecord: false, milestoneHit: null };
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = user.currentStreak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  const newRecord = newStreak > user.longestStreak;

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newRecord ? newStreak : undefined,
      lastActiveDate: new Date(),
    },
  });

  // Check streak milestones and award bonus XP
  let milestoneHit: number | null = null;
  const streakMilestones = [7, 30, 100];
  for (const milestone of streakMilestones) {
    if (newStreak === milestone) {
      milestoneHit = milestone;
      const bonusXP = milestone === 7 ? XP_VALUES.STREAK_7_BONUS : XP_VALUES.STREAK_30_BONUS;
      await awardXP(userId, bonusXP, "STREAK_BONUS", `streak-${milestone}`);
      break;
    }
  }

  return { currentStreak: newStreak, newRecord, milestoneHit };
}

// ─── Check and Award Badges ────────────────────────────────────────────────────

export async function checkAndAwardBadges(
  userId: string
): Promise<Array<{ slug: string; name: string; icon: string }>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      xp: true,
      practiceProgress: {
        where: { status: "COMPLETED" },
        select: { bankProblemId: true, problemId: true, language: true },
      },
      practiceSubmissions: {
        select: { timeSpentSeconds: true, submittedAt: true, status: true },
      },
    },
  });

  if (!user) return [];

  // Get existing badges
  const existingBadges = await prisma.userBadge.findMany({
    where: { userId },
    select: { badge: { select: { slug: true } } },
  });
  const earnedSlugs = new Set(existingBadges.map((b) => b.badge.slug));

  // Get all badge definitions
  const allBadges = await prisma.badge.findMany();
  const newBadges: Array<{ slug: string; name: string; icon: string }> = [];

  const solvedCount = user.practiceProgress.length;
  const streak = Math.max(user.currentStreak, user.longestStreak);

  // Count difficulties (we need problem data for this)
  // For simplicity, we check milestone and streak badges
  for (const badge of allBadges) {
    if (earnedSlugs.has(badge.slug)) continue;

    let earned = false;

    switch (badge.category) {
      case "STREAK":
        earned = streak >= badge.threshold;
        break;
      case "MILESTONE":
        earned = solvedCount >= badge.threshold;
        break;
      case "SPECIAL": {
        if (badge.slug === "speed-demon") {
          earned = user.practiceSubmissions.some(
            (s) => s.status === "ACCEPTED" && s.timeSpentSeconds < 300
          );
        } else if (badge.slug === "night-owl") {
          earned = user.practiceSubmissions.some((s) => {
            const hour = new Date(s.submittedAt).getHours();
            return s.status === "ACCEPTED" && (hour >= 0 && hour < 5);
          });
        } else if (badge.slug === "daily-devotee") {
          // Check daily challenge completions
          earned = false; // Will be checked separately
        }
        break;
      }
      case "SKILL": {
        if (badge.slug === "polyglot") {
          const langs = new Set(user.practiceProgress.map((p) => p.language).filter(Boolean));
          earned = langs.size >= badge.threshold;
        }
        // Easy/Medium/Hard counts would need problem difficulty data
        break;
      }
    }

    if (earned) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id },
      });
      // Award XP for badge
      await awardXP(userId, XP_VALUES.BADGE_EARNED, "BADGE_EARNED", badge.id);
      newBadges.push({ slug: badge.slug, name: badge.name, icon: badge.icon });
    }
  }

  return newBadges;
}

// ─── Record Problem Solved in Daily Activity ───────────────────────────────────

export async function recordProblemSolved(userId: string): Promise<void> {
  const today = new Date().toISOString().split("T")[0];
  await prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date: today } },
    create: { userId, date: today, problems: 1 },
    update: { problems: { increment: 1 } },
  });
}
