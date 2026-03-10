"use client";

import { useEffect, useState } from "react";
import LeaderboardRow from "@/components/gamification/LeaderboardRow";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  level: number;
  xp: number;
  periodXP: number;
  streak: number;
  problemsSolved: number;
}

type Period = "weekly" | "monthly" | "all";

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/gamification/leaderboard?period=${period}&page=${page}&limit=50`)
      .then((r) => (r.ok ? r.json() : { leaderboard: [], currentUserRank: 0 }))
      .then((data) => {
        setEntries(data.leaderboard || []);
        setCurrentUserRank(data.currentUserRank || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period, page]);

  const periods: { key: Period; label: string }[] = [
    { key: "weekly", label: "This Week" },
    { key: "monthly", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-gray-500">
          See how you rank against other candidates.
          {currentUserRank > 0 && (
            <span className="ml-2 font-medium text-saffron">
              Your rank: #{currentUserRank}
            </span>
          )}
        </p>
      </div>

      {/* Period Tabs */}
      <div className="flex gap-2 mb-6">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              setPeriod(p.key);
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              period === p.key
                ? "bg-saffron/10 text-saffron-dark border border-saffron/30"
                : "bg-gray-100 text-gray-500 border border-transparent hover:bg-gray-200"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-saffron border-t-transparent rounded-full" />
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No leaderboard data yet. Start solving problems to rank!</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                rank={entry.rank}
                name={entry.name}
                level={entry.level}
                xp={period === "all" ? entry.xp : entry.periodXP}
                streak={entry.streak}
                problemsSolved={entry.problemsSolved}
                isCurrentUser={entry.rank === currentUserRank}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
