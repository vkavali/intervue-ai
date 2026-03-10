"use client";

interface StreakCounterProps {
  currentStreak: number;
  longestStreak: number;
  isActiveToday?: boolean;
  compact?: boolean;
}

export default function StreakCounter({
  currentStreak,
  longestStreak,
  isActiveToday,
  compact,
}: StreakCounterProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5" title={`Longest: ${longestStreak} days`}>
        <span className={`text-base ${isActiveToday ? "animate-pulse" : "opacity-50"}`}>
          🔥
        </span>
        <span className="text-xs font-semibold text-gray-700">{currentStreak}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span
          className={`text-2xl ${isActiveToday ? "animate-pulse" : "opacity-40"}`}
        >
          🔥
        </span>
        <div>
          <p className="text-xl font-bold text-gray-900">{currentStreak}</p>
          <p className="text-xs text-gray-500">day streak</p>
        </div>
      </div>
      {longestStreak > 0 && (
        <p className="mt-2 text-[10px] text-gray-400">
          Longest: {longestStreak} days
        </p>
      )}
    </div>
  );
}
