import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
};

const aiLevelLabels: Record<number, string> = {
  0: "L0 No AI",
  1: "L1 Hint",
  2: "L2 Scaffold",
  3: "L3 Guide",
  4: "L4 Copilot",
};

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const authSession = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: authSession!.user.email! },
  });

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: params.id },
    include: {
      candidate: { select: { name: true, email: true } },
      interviewer: { select: { name: true, email: true } },
      template: {
        select: {
          title: true,
          role: true,
          seniority: true,
          roundType: true,
          questions: { orderBy: { orderIndex: "asc" } },
        },
      },
      auditReport: true,
      aiInteractions: { orderBy: { timestamp: "asc" } },
      aiLevelOverrides: {
        orderBy: { timestamp: "asc" },
        include: { overriddenBy: { select: { name: true } } },
      },
      interviewerNotes: {
        orderBy: { timestamp: "asc" },
        include: { interviewer: { select: { name: true } } },
      },
    },
  });

  if (!interviewSession || interviewSession.companyId !== user?.companyId) {
    notFound();
  }

  const s = interviewSession;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/sessions"
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          &larr; Back to Sessions
        </Link>
        <div className="mt-2 flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">
            {s.template.title}
          </h1>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${
              statusColors[s.status] || ""
            }`}
          >
            {s.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          {s.candidate.name} &middot; {s.template.role} &middot;{" "}
          {s.template.seniority}
        </p>
      </div>

      {/* Session Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Candidate
          </h3>
          <p className="text-sm font-medium text-white">{s.candidate.name}</p>
          <p className="text-xs text-gray-400">{s.candidate.email}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Interviewer
          </h3>
          {s.interviewer ? (
            <>
              <p className="text-sm font-medium text-white">
                {s.interviewer.name}
              </p>
              <p className="text-xs text-gray-400">{s.interviewer.email}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Not assigned</p>
          )}
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Timing
          </h3>
          <div className="space-y-1 text-sm">
            {s.startedAt && (
              <p className="text-gray-300">
                Started: {new Date(s.startedAt).toLocaleString()}
              </p>
            )}
            {s.endedAt && (
              <p className="text-gray-300">
                Ended: {new Date(s.endedAt).toLocaleString()}
              </p>
            )}
            {!s.startedAt && (
              <p className="text-gray-500">Not started yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Audit Report */}
      {s.auditReport && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-6">
            AI Audit Scorecard
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {s.auditReport.overallScore.toFixed(1)}
              </div>
              <p className="text-xs text-gray-400 mt-1">Overall Score</p>
            </div>
            <div className="text-center">
              <div
                className={`text-2xl font-bold ${
                  s.auditReport.suggestedDecision === "HIRE"
                    ? "text-green-400"
                    : s.auditReport.suggestedDecision === "NO_HIRE"
                      ? "text-red-400"
                      : "text-yellow-400"
                }`}
              >
                {s.auditReport.suggestedDecision.replace("_", " ")}
              </div>
              <p className="text-xs text-gray-400 mt-1">Decision</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {(s.auditReport.confidence * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-gray-400 mt-1">Confidence</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {s.aiInteractions.length}
              </div>
              <p className="text-xs text-gray-400 mt-1">AI Interactions</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Problem Comprehension", value: s.auditReport.problemComprehension },
              { label: "Solution Correctness", value: s.auditReport.solutionCorrectness },
              { label: "Code Quality", value: s.auditReport.codeQuality },
              { label: "Communication", value: s.auditReport.communication },
              { label: "AI Usage Quality", value: s.auditReport.aiUsageQuality },
              { label: "Time Management", value: s.auditReport.timeManagement },
            ].map((score) => (
              <div
                key={score.label}
                className="rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">{score.label}</span>
                  <span className="text-sm font-semibold text-white">
                    {score.value.toFixed(1)}/10
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                    style={{ width: `${(score.value / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Reasoning */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              AI Reasoning
            </h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">
              {s.auditReport.reasoning}
            </p>
          </div>
        </div>
      )}

      {/* AI Interaction Log */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          AI Interaction Log ({s.aiInteractions.length})
        </h2>

        {s.aiInteractions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No AI interactions recorded for this session.
          </p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {s.aiInteractions.map((interaction) => (
              <div
                key={interaction.id}
                className="rounded-lg border border-gray-700 bg-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-purple-400">
                    {aiLevelLabels[interaction.aiLevel] || `L${interaction.aiLevel}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(interaction.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Candidate asked:</p>
                    <p className="text-sm text-gray-300">{interaction.prompt}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">AI responded:</p>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {interaction.response}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Level Overrides Timeline */}
      {s.aiLevelOverrides.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            AI Level Overrides
          </h2>
          <div className="space-y-3">
            {s.aiLevelOverrides.map((override) => (
              <div
                key={override.id}
                className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800 p-3"
              >
                <span className="text-xs text-gray-500">
                  {new Date(override.timestamp).toLocaleTimeString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {aiLevelLabels[override.previousLevel]}
                  </span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="text-sm font-medium text-purple-400">
                    {aiLevelLabels[override.newLevel]}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  by {override.overriddenBy.name}
                </span>
                <span className="text-xs text-gray-400 italic">
                  &quot;{override.reason}&quot;
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interviewer Notes */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Interviewer Notes ({s.interviewerNotes.length})
        </h2>

        {s.interviewerNotes.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No notes recorded for this session.
          </p>
        ) : (
          <div className="space-y-3">
            {s.interviewerNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-gray-700 bg-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-400">
                    {note.interviewer.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(note.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
