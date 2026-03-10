import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReassignInterviewerForm } from "./ReassignInterviewerForm";
import { RescheduleForm } from "./RescheduleForm";
import { GenerateThinkingButton } from "./GenerateThinkingButton";

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

const logActionLabels: Record<string, { label: string; color: string }> = {
  JOIN: { label: "Joined", color: "text-green-400" },
  LEAVE: { label: "Left", color: "text-red-400" },
  CODE_CHANGE: { label: "Code Change", color: "text-blue-400" },
  LANGUAGE_CHANGE: { label: "Language Change", color: "text-cyan-400" },
  AI_REQUEST: { label: "AI Request", color: "text-saffron" },
  NOTE_ADDED: { label: "Note Added", color: "text-yellow-400" },
  OVERRIDE: { label: "AI Override", color: "text-orange-400" },
  VIOLATION: { label: "Violation", color: "text-red-500" },
};

export default async function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const authSession = await getServerSession(authOptions);
  if (!authSession?.user) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { email: authSession.user.email! },
  });

  if (!user?.companyId) {
    notFound();
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: params.id },
    include: {
      candidate: { select: { id: true, name: true, email: true } },
      interviewer: { select: { id: true, name: true, email: true } },
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
      thinkingAnalysis: true,
      aiInteractions: { orderBy: { timestamp: "asc" } },
      aiLevelOverrides: {
        orderBy: { timestamp: "asc" },
        include: { overriddenBy: { select: { name: true } } },
      },
      interviewerNotes: {
        orderBy: { timestamp: "asc" },
        include: { interviewer: { select: { name: true } } },
      },
      violations: {
        orderBy: { timestamp: "asc" },
        include: { user: { select: { name: true } } },
      },
      sessionLogs: {
        orderBy: { timestamp: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!interviewSession || interviewSession.companyId !== user.companyId) {
    notFound();
  }

  // Fetch available interviewers in this company for the reassignment form
  const companyInterviewers = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      role: { in: ["INTERVIEWER", "COMPANY_ADMIN"] },
    },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const s = interviewSession;
  const violationCount = s.violations.length;

  return (
    <div className="min-h-screen bg-gray-950">
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
              statusColors[s.status] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
            }`}
          >
            {s.status}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          {s.template.role} &middot; {s.template.seniority} &middot;{" "}
          {s.template.roundType}
        </p>
      </div>

      {/* Session Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
            AI Level
          </h3>
          <p className="text-sm font-medium text-saffron">
            {aiLevelLabels[s.aiLevel] || `L${s.aiLevel}`}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {s.aiInteractions.length} interaction{s.aiInteractions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Timing
          </h3>
          <div className="space-y-1 text-sm">
            {s.scheduledAt && (
              <p className="text-gray-300">
                Scheduled: {new Date(s.scheduledAt).toLocaleString()}
              </p>
            )}
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
            {!s.startedAt && !s.scheduledAt && (
              <p className="text-gray-500">Not scheduled yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Interviewer Reassignment */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Interviewer Assignment
        </h2>
        <ReassignInterviewerForm
          sessionId={s.id}
          currentInterviewerId={s.interviewerId}
          interviewers={companyInterviewers}
        />
      </div>

      {/* Reschedule (PENDING sessions only) */}
      {s.status === "PENDING" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Schedule / Reschedule
          </h2>
          <RescheduleForm
            sessionId={s.id}
            currentScheduledAt={s.scheduledAt?.toISOString() ?? null}
          />
        </div>
      )}

      {/* Violation Summary */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Violations ({violationCount})
        </h2>
        {violationCount === 0 ? (
          <p className="text-sm text-gray-500 py-2">
            No violations detected during this session.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Summary by type */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(
                s.violations.reduce<Record<string, number>>((acc, v) => {
                  acc[v.type] = (acc[v.type] || 0) + 1;
                  return acc;
                }, {})
              ).map(([type, count]) => (
                <div
                  key={type}
                  className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2"
                >
                  <span className="text-xs font-medium text-red-400">
                    {type.replace(/_/g, " ")}
                  </span>
                  <span className="ml-2 text-sm font-bold text-red-300">{count}</span>
                </div>
              ))}
            </div>

            {/* Individual violations */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {s.violations.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800 p-3"
                >
                  <span className="text-xs text-gray-500">
                    {new Date(v.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-xs font-medium text-red-400">
                    {v.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-gray-400">{v.user.name}</span>
                  {v.details && (
                    <span className="text-xs text-gray-500 italic truncate">
                      {v.details}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Audit Report Summary */}
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
                    className="h-full rounded-full bg-gradient-to-r from-saffron-light to-india-green-light"
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

      {/* Thinking Analysis */}
      {s.thinkingAnalysis ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">
              Thinking Analysis
            </h2>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  s.thinkingAnalysis.confidenceLevel === "high"
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : s.thinkingAnalysis.confidenceLevel === "medium"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                      : "bg-gray-500/10 text-gray-400 border-gray-500/30"
                }`}
              >
                {s.thinkingAnalysis.confidenceLevel} confidence
              </span>
              <GenerateThinkingButton sessionId={s.id} label="Regenerate" />
            </div>
          </div>

          {/* Overall Approach */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Overall Approach
            </h4>
            <p className="text-sm text-gray-300">
              {s.thinkingAnalysis.overallApproach}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Problem Solving Stage */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Problem Solving Stage
              </h4>
              <p className="text-sm font-medium text-saffron capitalize">
                {s.thinkingAnalysis.problemSolvingStage}
              </p>
            </div>

            {/* AI Usage Pattern */}
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                AI Usage Pattern
              </h4>
              <p className="text-sm text-gray-300">
                {s.thinkingAnalysis.aiUsagePattern}
              </p>
            </div>
          </div>

          {/* Thinking Patterns */}
          {(() => {
            const patterns = JSON.parse(s.thinkingAnalysis.thinkingPatterns) as {
              pattern: string;
              evidence: string;
              strength: string;
            }[];
            return patterns.length > 0 ? (
              <div className="mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Thinking Patterns
                </h4>
                <div className="space-y-2">
                  {patterns.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-gray-700 bg-gray-800 p-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex h-2 w-2 rounded-full ${
                            p.strength === "positive"
                              ? "bg-green-400"
                              : p.strength === "concerning"
                                ? "bg-red-400"
                                : "bg-gray-400"
                          }`}
                        />
                        <span className="text-sm font-medium text-white">
                          {p.pattern}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 pl-4">{p.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Strengths */}
            {(() => {
              const strengths = JSON.parse(s.thinkingAnalysis.strengths) as string[];
              return strengths.length > 0 ? (
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-green-400 mb-2">
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}

            {/* Concerns */}
            {(() => {
              const concerns = JSON.parse(s.thinkingAnalysis.concerns) as string[];
              return concerns.length > 0 ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-2">
                    Concerns
                  </h4>
                  <ul className="space-y-1">
                    {concerns.map((c, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">!</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}
          </div>

          {/* Suggested Follow-Up */}
          {(() => {
            const followUps = JSON.parse(s.thinkingAnalysis.suggestedFollowUp) as string[];
            return followUps.length > 0 ? (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
                  Suggested Follow-Up Questions
                </h4>
                <ul className="space-y-1">
                  {followUps.map((q, i) => (
                    <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">{i + 1}.</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null;
          })()}
        </div>
      ) : (
        (s.status === "COMPLETED" || s.status === "ACTIVE") && s.aiInteractions.length > 0 && (
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Thinking Analysis
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  No thinking analysis generated yet for this session.
                </p>
              </div>
              <GenerateThinkingButton sessionId={s.id} label="Generate Analysis" />
            </div>
          </div>
        )
      )}

      {/* Session Timeline / Logs */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">
          Session Timeline ({s.sessionLogs.length})
        </h2>

        {s.sessionLogs.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">
            No activity logs recorded for this session.
          </p>
        ) : (
          <div className="relative max-h-96 overflow-y-auto">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700" />

            <div className="space-y-4 pl-10">
              {s.sessionLogs.map((log) => {
                const actionInfo = logActionLabels[log.action] || {
                  label: log.action,
                  color: "text-gray-400",
                };

                return (
                  <div key={log.id} className="relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-gray-700 bg-gray-900" />

                    <div className="rounded-lg border border-gray-700 bg-gray-800 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            {log.user.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
                  <span className="text-xs font-medium text-saffron">
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
                  <span className="text-sm font-medium text-saffron">
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
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-8">
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

      {/* Questions from Template */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Questions ({s.template.questions.length})
        </h2>
        <div className="space-y-3">
          {s.template.questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-700 text-xs font-bold text-gray-300">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-medium text-white">{q.title}</h4>
                <span className="text-xs text-gray-500">{q.difficulty}</span>
                <span className="text-xs text-saffron">
                  {aiLevelLabels[q.aiLevel] || `L${q.aiLevel}`}
                </span>
                <span className="text-xs text-gray-500">{q.timeLimit} min</span>
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{q.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
