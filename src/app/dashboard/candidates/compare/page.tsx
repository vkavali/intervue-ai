"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface RoundSummary {
  round: string;
  score: number;
  highlights: string;
  concerns: string;
}

interface CandidateAnalysis {
  candidateId: string;
  candidateName: string;
  roundsSummary: RoundSummary[];
  overallImpression: string;
  standoutQualities: string[];
  concerns: string[];
  growthDuringInterview: string;
  teamFitAssessment: string;
  rank: number;
}

interface Recommendation {
  selectedCandidate: string;
  selectedCandidateId: string;
  reasoning: string;
  confidence: "high" | "medium" | "low";
  alternateConsideration: string;
  tradeoffs: string;
}

interface ComparisonAnalysis {
  candidates: CandidateAnalysis[];
  recommendation: Recommendation;
  overallObservations: string;
  interviewProcessFeedback: string;
}

const confidenceColors: Record<string, string> = {
  high: "bg-green-500/10 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  low: "bg-red-500/10 text-red-400 border-red-500/30",
};

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-800" />
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-gray-800" />
          <div className="h-3 w-48 rounded bg-gray-800" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-full rounded bg-gray-800" />
        <div className="h-3 w-5/6 rounded bg-gray-800" />
        <div className="h-3 w-4/6 rounded bg-gray-800" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-6 w-20 rounded-full bg-gray-800" />
        <div className="h-6 w-24 rounded-full bg-gray-800" />
        <div className="h-6 w-16 rounded-full bg-gray-800" />
      </div>
    </div>
  );
}

function SkeletonRecommendation() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-8">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-800" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-64 rounded bg-gray-800" />
          <div className="h-4 w-full rounded bg-gray-800" />
          <div className="h-4 w-3/4 rounded bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

function getRankBadgeColor(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40";
    case 2:
      return "bg-gray-400/20 text-gray-300 border-gray-400/40";
    case 3:
      return "bg-orange-500/20 text-orange-400 border-orange-500/40";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/30";
  }
}

export default function CandidateComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <CandidateCompareContent />
    </Suspense>
  );
}

function CandidateCompareContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "";

  const [analysis, setAnalysis] = useState<ComparisonAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateComparison() {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/pipeline/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate comparison");
        return;
      }

      setAnalysis(data.analysis);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-fetch on mount if the user hasn't explicitly requested it
  useEffect(() => {
    // We don't auto-fetch; user should click "Generate AI Comparison"
  }, []);

  const sortedCandidates = analysis?.candidates
    ? [...analysis.candidates].sort((a, b) => a.rank - b.rank)
    : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link
            href="/dashboard/candidates"
            className="hover:text-purple-400 transition-colors"
          >
            Candidates
          </Link>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-300">Compare</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Compare Candidates
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              {role ? (
                <>
                  AI-powered comparison for{" "}
                  <span className="text-purple-400 font-medium">{role}</span>
                </>
              ) : (
                "Select a role to compare candidates"
              )}
            </p>
          </div>
          <button
            onClick={generateComparison}
            disabled={loading || !role}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing Candidates...
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generate AI Comparison
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <SkeletonRecommendation />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="h-4 w-40 rounded bg-gray-800 mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-800" />
                <div className="h-3 w-5/6 rounded bg-gray-800" />
              </div>
            </div>
            <div className="animate-pulse rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="h-4 w-48 rounded bg-gray-800 mb-3" />
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-gray-800" />
                <div className="h-3 w-4/6 rounded bg-gray-800" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State (no comparison yet, not loading) */}
      {!loading && !analysis && !error && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">
            Ready to Compare
          </h3>
          <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
            Click &quot;Generate AI Comparison&quot; to analyze all candidates
            for the{" "}
            <span className="text-purple-400 font-medium">{role}</span> role.
            The AI will evaluate their interview performance and provide a hiring
            recommendation.
          </p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-8">
          {/* Recommendation Banner */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 p-8">
            <div className="flex items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-2xl font-bold text-purple-400">
                {analysis.recommendation.selectedCandidate
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">
                    We recommend{" "}
                    {analysis.recommendation.selectedCandidate}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${
                      confidenceColors[analysis.recommendation.confidence] ||
                      confidenceColors.medium
                    }`}
                  >
                    {analysis.recommendation.confidence.toUpperCase()} CONFIDENCE
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-3">
                  {analysis.recommendation.reasoning}
                </p>
                {analysis.recommendation.alternateConsideration && (
                  <p className="text-xs text-gray-500 italic">
                    {analysis.recommendation.alternateConsideration}
                  </p>
                )}
                {analysis.recommendation.tradeoffs && (
                  <p className="mt-2 text-xs text-gray-400">
                    <span className="font-medium text-gray-300">
                      Trade-offs:{" "}
                    </span>
                    {analysis.recommendation.tradeoffs}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ranked Candidate Cards */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Candidate Rankings
            </h3>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {sortedCandidates.map((candidate) => (
                <div
                  key={candidate.candidateId}
                  className={`rounded-xl border bg-gray-900 p-6 transition-colors ${
                    candidate.rank === 1
                      ? "border-purple-500/40 ring-1 ring-purple-500/20"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Rank Badge + Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${getRankBadgeColor(
                        candidate.rank
                      )}`}
                    >
                      #{candidate.rank}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {candidate.candidateName}
                      </h4>
                    </div>
                  </div>

                  {/* Overall Impression */}
                  <p className="mb-4 text-xs text-gray-400 leading-relaxed">
                    {candidate.overallImpression}
                  </p>

                  {/* Rounds Summary Mini Table */}
                  {candidate.roundsSummary &&
                    candidate.roundsSummary.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Rounds
                        </p>
                        <div className="space-y-1.5">
                          {candidate.roundsSummary.map((round, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between rounded-md bg-gray-950/50 px-3 py-1.5"
                            >
                              <span className="text-xs text-gray-300">
                                {round.round}
                              </span>
                              <span className="text-xs font-medium text-white">
                                {round.score}/100
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Standout Qualities */}
                  {candidate.standoutQualities &&
                    candidate.standoutQualities.length > 0 && (
                      <div className="mb-3">
                        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Standout Qualities
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {candidate.standoutQualities.map((quality, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs text-green-400"
                            >
                              {quality}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Concerns */}
                  {candidate.concerns && candidate.concerns.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Concerns
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.concerns.map((concern, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs text-red-400"
                          >
                            {concern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Growth Assessment */}
                  {candidate.growthDuringInterview && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Growth
                      </p>
                      <p className="text-xs text-gray-400">
                        {candidate.growthDuringInterview}
                      </p>
                    </div>
                  )}

                  {/* Team Fit */}
                  {candidate.teamFitAssessment && (
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Team Fit
                      </p>
                      <p className="text-xs text-gray-400">
                        {candidate.teamFitAssessment}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overall Observations + Interview Process Feedback */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Overall Observations */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <h3 className="text-sm font-semibold text-white">
                  Overall Observations
                </h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {analysis.overallObservations}
              </p>
            </div>

            {/* Interview Process Feedback */}
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="h-5 w-5 text-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-sm font-semibold text-white">
                  Interview Process Feedback
                </h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {analysis.interviewProcessFeedback}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
