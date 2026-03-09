"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface PatternStat {
  pattern: string;
  attempted: number;
  completed: number;
  abandoned: number;
  avgTimeSeconds: number;
  completionRate: number;
  score: number;
}

interface WeaknessProfileData {
  weakPatterns: PatternStat[];
  strongPatterns: PatternStat[];
  overallStats: {
    totalAttempted: number;
    totalCompleted: number;
    totalAbandoned: number;
    avgTimeSeconds: number;
    overallCompletionRate: number;
  };
  generatedAt: string;
}

interface Recommendation {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  pattern?: string;
  tags: string[];
  score: number;
  reasons: string[];
}

const diffColors: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-red-400",
};

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// SVG-based radar chart (no deps)
function RadarChart({ stats }: { stats: PatternStat[] }) {
  if (stats.length < 3) return null;

  const displayed = stats.slice(0, 8); // max 8 axes
  const cx = 150, cy = 150, maxR = 120;
  const n = displayed.length;
  const angleStep = (2 * Math.PI) / n;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  // Grid rings
  const rings = [25, 50, 75, 100];

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto">
      {/* Grid */}
      {rings.map((r) => (
        <polygon
          key={r}
          points={Array.from({ length: n }, (_, i) => {
            const p = getPoint(i, r);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgb(55, 65, 81)"
          strokeWidth={0.5}
        />
      ))}

      {/* Axis lines */}
      {displayed.map((_, i) => {
        const p = getPoint(i, 100);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgb(55, 65, 81)" strokeWidth={0.5} />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={displayed.map((s, i) => {
          const p = getPoint(i, s.score);
          return `${p.x},${p.y}`;
        }).join(" ")}
        fill="rgba(168, 85, 247, 0.2)"
        stroke="rgb(168, 85, 247)"
        strokeWidth={2}
      />

      {/* Data dots + labels */}
      {displayed.map((stat, i) => {
        const p = getPoint(i, stat.score);
        const lp = getPoint(i, 115);
        return (
          <g key={stat.pattern}>
            <circle cx={p.x} cy={p.y} r={3} fill="rgb(168, 85, 247)" />
            <text
              x={lp.x}
              y={lp.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400"
              fontSize={9}
            >
              {stat.pattern.length > 12 ? stat.pattern.slice(0, 10) + ".." : stat.pattern}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function PracticeAnalyticsPage() {
  const [profile, setProfile] = useState<WeaknessProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    fetch("/api/practice/weakness-profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.profile) setProfile(data.profile); })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/practice/recommend?count=6")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data?.recommendations) setRecommendations(data.recommendations); })
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, []);

  const allPatterns = useMemo(() => {
    if (!profile) return [];
    return [...profile.weakPatterns, ...profile.strongPatterns].sort((a, b) => a.score - b.score);
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/practice" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Practice
            </Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-purple-400">Analytics</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Practice Analytics</h1>
          <p className="mt-2 text-gray-400">Track your progress, identify weaknesses, and get personalized recommendations.</p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {!profile || allPatterns.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-semibold text-white mb-2">No Data Yet</h2>
            <p className="text-gray-500 mb-6">Start practicing problems to see your analytics and get personalized recommendations.</p>
            <Link href="/practice" className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors">
              Start Practicing
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Problems Attempted", value: profile.overallStats.totalAttempted, color: "text-blue-400" },
                { label: "Completed", value: profile.overallStats.totalCompleted, color: "text-green-400" },
                { label: "Completion Rate", value: `${Math.round(profile.overallStats.overallCompletionRate * 100)}%`, color: "text-purple-400" },
                { label: "Avg Time", value: formatTime(profile.overallStats.avgTimeSeconds), color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Radar Chart + Weak Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Radar */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Skill Radar</h2>
                {allPatterns.length >= 3 ? (
                  <RadarChart stats={allPatterns} />
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">Need at least 3 patterns practiced to display radar chart.</p>
                )}
              </div>

              {/* Weak Patterns */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  {profile.weakPatterns.length > 0 ? "Areas to Improve" : "Pattern Scores"}
                </h2>
                <div className="space-y-3">
                  {(profile.weakPatterns.length > 0 ? profile.weakPatterns : allPatterns.slice(0, 5)).map((stat) => (
                    <div key={stat.pattern} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{stat.pattern}</span>
                          <span className={`text-xs font-semibold ${stat.score >= 60 ? "text-green-400" : stat.score >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                            {stat.score}/100
                          </span>
                        </div>
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              stat.score >= 60 ? "bg-green-500" : stat.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${stat.score}%` }}
                          />
                        </div>
                        <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
                          <span>{stat.attempted} attempted</span>
                          <span>{stat.completed} completed</span>
                          <span>avg {formatTime(stat.avgTimeSeconds)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pattern Breakdown Table */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Pattern Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-800">
                      <th className="pb-3 pr-4">Pattern</th>
                      <th className="pb-3 pr-4">Attempted</th>
                      <th className="pb-3 pr-4">Completed</th>
                      <th className="pb-3 pr-4">Abandoned</th>
                      <th className="pb-3 pr-4">Completion Rate</th>
                      <th className="pb-3 pr-4">Avg Time</th>
                      <th className="pb-3">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allPatterns.map((stat) => (
                      <tr key={stat.pattern} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-3 pr-4 text-gray-300 font-medium">{stat.pattern}</td>
                        <td className="py-3 pr-4 text-gray-400">{stat.attempted}</td>
                        <td className="py-3 pr-4 text-green-400">{stat.completed}</td>
                        <td className="py-3 pr-4 text-red-400">{stat.abandoned}</td>
                        <td className="py-3 pr-4">
                          <span className={`${stat.completionRate >= 0.7 ? "text-green-400" : stat.completionRate >= 0.4 ? "text-yellow-400" : "text-red-400"}`}>
                            {Math.round(stat.completionRate * 100)}%
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{formatTime(stat.avgTimeSeconds)}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${stat.score >= 60 ? "bg-green-500" : stat.score >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                                style={{ width: `${stat.score}%` }}
                              />
                            </div>
                            <span className="text-gray-400 text-xs">{stat.score}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
              <h2 className="text-lg font-semibold text-white mb-1">Recommended Next Problems</h2>
              <p className="text-sm text-gray-500 mb-4">Based on your weakness profile and practice history.</p>

              {loadingRecs ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading recommendations...
                </div>
              ) : recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <div key={rec.id} className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 hover:border-purple-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${diffColors[rec.difficulty] || "text-gray-400"}`}>
                          {rec.difficulty}
                        </span>
                        {rec.pattern && (
                          <span className="text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded px-1.5 py-0.5">
                            {rec.pattern}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-2">{rec.title}</h3>
                      <div className="space-y-1 mb-3">
                        {rec.reasons.map((reason, i) => (
                          <p key={i} className="text-[11px] text-gray-500 flex items-start gap-1">
                            <span className="text-purple-400 mt-px shrink-0">*</span> {reason}
                          </p>
                        ))}
                      </div>
                      <Link
                        href={`/practice/${rec.id}?aiLevel=2`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-500 transition-colors"
                      >
                        Start Practice
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-4">No recommendations available yet. Practice more problems to get personalized suggestions.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
