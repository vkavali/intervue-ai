"use client";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  level: number;
  xp: number;
  streak: number;
  problemsSolved: number;
  isCurrentUser?: boolean;
}

export default function LeaderboardRow({
  rank,
  name,
  level,
  xp,
  streak,
  problemsSolved,
  isCurrentUser,
}: LeaderboardRowProps) {
  const rankDisplay =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border px-4 py-3 transition-colors ${
        isCurrentUser
          ? "border-saffron/30 bg-saffron/5"
          : "border-gray-200 bg-white hover:bg-gray-50"
      }`}
    >
      <span className="w-10 text-center text-sm font-bold text-gray-600">
        {rankDisplay}
      </span>

      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-india-green/10 text-xs font-bold text-india-green">
        {name.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {name}
          {isCurrentUser && (
            <span className="ml-2 text-[10px] text-saffron">(You)</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/10 text-[10px] font-bold text-saffron">
          {level}
        </span>
        <span className="text-xs text-gray-500 w-16 text-right">{xp.toLocaleString()} XP</span>
      </div>

      <div className="flex items-center gap-1 w-14">
        <span className="text-xs">🔥</span>
        <span className="text-xs text-gray-600">{streak}</span>
      </div>

      <div className="w-16 text-right">
        <span className="text-xs text-gray-500">{problemsSolved} solved</span>
      </div>
    </div>
  );
}
