"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DailyChallengeCardProps {
  problem: {
    id: string;
    title: string;
    difficulty: string;
    description: string;
    tags: string;
  } | null;
  bonusXP: number;
  completed: boolean;
  timeUntilNextMs: number;
}

function formatTimeLeft(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

const diffColors: Record<string, string> = {
  EASY: "text-green-500 bg-green-50",
  MEDIUM: "text-yellow-500 bg-yellow-50",
  HARD: "text-red-500 bg-red-50",
};

export default function DailyChallengeCard({
  problem,
  bonusXP,
  completed,
  timeUntilNextMs,
}: DailyChallengeCardProps) {
  const [timeLeft, setTimeLeft] = useState(timeUntilNextMs);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!problem) {
    return null;
  }

  let tags: string[] = [];
  try {
    tags = JSON.parse(problem.tags);
  } catch {
    // ignore
  }

  return (
    <div className="rounded-xl border border-saffron/30 bg-gradient-to-r from-saffron/5 to-india-green/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⭐</span>
          <h3 className="text-sm font-semibold text-gray-900">Daily Challenge</h3>
          <span className="rounded-full bg-saffron/10 px-2 py-0.5 text-[10px] font-semibold text-saffron">
            +{bonusXP} XP Bonus
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Next in {formatTimeLeft(timeLeft)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-base font-medium text-gray-900">{problem.title}</h4>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${diffColors[problem.difficulty] || "text-gray-500 bg-gray-100"}`}>
              {problem.difficulty}
            </span>
          </div>
          {tags.length > 0 && (
            <div className="flex gap-1.5 mt-1">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {completed ? (
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Completed
          </span>
        ) : (
          <Link
            href={`/practice/${problem.id}`}
            className="rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            Start Challenge
          </Link>
        )}
      </div>
    </div>
  );
}
