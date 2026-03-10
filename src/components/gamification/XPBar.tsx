"use client";

import { useEffect, useState } from "react";

interface XPBarProps {
  xp: number;
  level: number;
  xpProgress: { current: number; needed: number; percentage: number };
  compact?: boolean;
}

export default function XPBar({ xp, level, xpProgress, compact }: XPBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(xpProgress.percentage), 100);
    return () => clearTimeout(timer);
  }, [xpProgress.percentage]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron/10 text-xs font-bold text-saffron">
          {level}
        </span>
        <div className="flex-1">
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-saffron transition-all duration-700 ease-out"
              style={{ width: `${animatedWidth}%` }}
            />
          </div>
        </div>
        <span className="text-[10px] text-gray-400">{xp} XP</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron/10 text-sm font-bold text-saffron">
            {level}
          </span>
          <span className="text-sm font-medium text-gray-900">Level {level}</span>
        </div>
        <span className="text-xs text-gray-500">
          {xpProgress.current} / {xpProgress.needed} XP
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-saffron to-india-green transition-all duration-700 ease-out"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-gray-400">
        {xpProgress.needed - xpProgress.current} XP to Level {level + 1}
      </p>
    </div>
  );
}
