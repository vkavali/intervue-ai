"use client";

import XPBar from "@/components/gamification/XPBar";
import StreakCounter from "@/components/gamification/StreakCounter";

interface SidebarGamificationProps {
  xp: number;
  level: number;
  xpProgress: { current: number; needed: number; percentage: number };
  currentStreak: number;
  longestStreak: number;
  isActiveToday: boolean;
}

export default function SidebarGamification({
  xp,
  level,
  xpProgress,
  currentStreak,
  longestStreak,
  isActiveToday,
}: SidebarGamificationProps) {
  return (
    <div className="border-b border-gray-200 px-4 py-4 space-y-3">
      <XPBar xp={xp} level={level} xpProgress={xpProgress} compact />
      <div className="flex items-center justify-between">
        <StreakCounter
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          isActiveToday={isActiveToday}
          compact
        />
        <span className="text-[10px] text-gray-400">{xp.toLocaleString()} XP total</span>
      </div>
    </div>
  );
}
