"use client";

import { useEffect, useState } from "react";
import ActivityHeatmap from "@/components/gamification/ActivityHeatmap";
import DailyChallengeCard from "@/components/gamification/DailyChallengeCard";
import Link from "next/link";

interface Props {
  heatmap: Array<{ date: string; problems: number; xpEarned: number }>;
  recentBadges: Array<{ slug: string; name: string; icon: string; earnedAt: string }>;
}

interface DailyChallengeData {
  date: string;
  bonusXP: number;
  problem: {
    id: string;
    title: string;
    difficulty: string;
    description: string;
    tags: string;
  };
  completed: boolean;
  timeUntilNextMs: number;
}

export default function CandidateDashboardClient({ heatmap, recentBadges }: Props) {
  const [challenge, setChallenge] = useState<DailyChallengeData | null>(null);

  useEffect(() => {
    fetch("/api/gamification/daily-challenge")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.challenge) setChallenge(data.challenge);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* Daily Challenge */}
      {challenge && (
        <div className="mb-8">
          <DailyChallengeCard
            problem={challenge.problem}
            bonusXP={challenge.bonusXP}
            completed={challenge.completed}
            timeUntilNextMs={challenge.timeUntilNextMs}
          />
        </div>
      )}

      {/* Activity Heatmap */}
      <div className="mb-8">
        <ActivityHeatmap data={heatmap} />
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Recent Badges</h2>
            <Link href="/candidate/badges" className="text-xs text-saffron hover:text-saffron-dark transition-colors">
              View All &rarr;
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentBadges.map((badge) => (
              <div
                key={badge.slug}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 whitespace-nowrap"
              >
                <span className="text-xl">{badge.icon}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(badge.earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
