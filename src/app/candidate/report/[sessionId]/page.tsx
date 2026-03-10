import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ScoreRing } from "@/components/ScoreRing"
import { MetricBar } from "@/components/MetricBar"
import { ShareReportButton } from "@/components/ShareReportButton"
import Link from "next/link"

const decisionConfig: Record<string, { label: string; color: string; bg: string; glow: string }> = {
  HIRE: { label: "Hire", color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", glow: "shadow-green-500/20" },
  NO_HIRE: { label: "No Hire", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", glow: "shadow-red-500/20" },
  FURTHER_ROUND: { label: "Further Round", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", glow: "shadow-yellow-500/20" },
}

export default async function CandidateReportPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/candidate/report/${params.sessionId}`)
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: params.sessionId },
    include: {
      template: {
        select: { title: true, role: true, seniority: true, roundType: true },
      },
      company: {
        select: { name: true },
      },
      auditReport: true,
    },
  })

  if (!interviewSession) {
    notFound()
  }

  // Verify candidate owns this session
  if (interviewSession.candidateId !== session.user.id) {
    redirect("/candidate")
  }

  const report = interviewSession.auditReport

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950 p-12 text-center shadow-2xl">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6">
            <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Report Not Ready</h3>
          <p className="mt-3 text-sm text-gray-400 max-w-sm mx-auto">
            The AI audit engine is analyzing your session. Check back soon for your detailed performance report.
          </p>
          <Link
            href="/candidate"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/20 transition-all hover:shadow-purple-600/40 hover:scale-[1.02]"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const decision = decisionConfig[report.suggestedDecision]

  // Parse JSON fields
  let riskFlags: string[] = []
  let quoteHighlights: string[] = []
  try { riskFlags = JSON.parse(report.riskFlags) } catch {}
  try { quoteHighlights = JSON.parse(report.quoteHighlights) } catch {}

  const metrics = [
    { label: "Problem Comprehension", value: report.problemComprehension },
    { label: "Solution Correctness", value: report.solutionCorrectness },
    { label: "Code Quality", value: report.codeQuality },
    { label: "Communication", value: report.communication },
    { label: "AI Usage Quality", value: report.aiUsageQuality },
    { label: "Time Management", value: report.timeManagement },
  ]

  const strengths = metrics.filter((m) => m.value >= 7)
  const improvements = metrics.filter((m) => m.value < 7)

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      {/* Background decorations */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-b from-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-40 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back nav */}
      <Link
        href="/candidate"
        className="relative inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-400 transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </Link>

      {/* 1. Header */}
      <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-gray-900/80 to-blue-900/20 p-8 shadow-2xl shadow-purple-900/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 mb-3">Performance Report</p>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {interviewSession.template.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-700/50 bg-gray-800/50 px-3 py-1 text-xs">
              {interviewSession.company.name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
              {interviewSession.template.role}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
              {interviewSession.template.seniority}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
              {interviewSession.template.roundType}
            </span>
            {interviewSession.endedAt && (
              <span className="text-xs text-gray-500">
                {new Date(interviewSession.endedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Score Overview */}
      <div className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/90 to-gray-950 p-8 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
        <div className="relative flex items-center justify-between flex-wrap gap-8">
          <div className="flex items-center gap-8">
            <ScoreRing score={report.overallScore} size={140} strokeWidth={10} />
            <div className="space-y-3">
              {decision && (
                <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold shadow-lg ${decision.bg} ${decision.color} ${decision.glow}`}>
                  {decision.label}
                </span>
              )}
              <p className="text-sm text-gray-400">
                Confidence: <span className="font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{(report.confidence * 100).toFixed(0)}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Metric Bars */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950 p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white">Performance Breakdown</h2>
        </div>
        <div className="space-y-5">
          {metrics.map((m) => (
            <MetricBar key={m.label} label={m.label} value={m.value} />
          ))}
        </div>
      </div>

      {/* 4. Strengths */}
      {strengths.length > 0 && (
        <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-900/10 via-gray-900/80 to-gray-950 p-8 shadow-xl shadow-green-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Strengths</h2>
          </div>
          <div className="space-y-3">
            {strengths.map((s) => (
              <div key={s.label} className="flex items-center justify-between rounded-xl bg-green-500/5 border border-green-500/10 p-4 transition-all hover:border-green-500/30">
                <span className="text-sm font-medium text-gray-200">{s.label}</span>
                <span className="text-sm font-bold text-green-400">{s.value.toFixed(1)} / 10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Areas to Improve */}
      {(improvements.length > 0 || riskFlags.length > 0) && (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/10 via-gray-900/80 to-gray-950 p-8 shadow-xl shadow-amber-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Areas to Improve</h2>
          </div>
          {improvements.length > 0 && (
            <div className="space-y-3 mb-6">
              {improvements.map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-xl bg-amber-500/5 border border-amber-500/10 p-4 transition-all hover:border-amber-500/30">
                  <span className="text-sm font-medium text-gray-200">{m.label}</span>
                  <span className={`text-sm font-bold ${m.value >= 4 ? "text-amber-400" : "text-red-400"}`}>
                    {m.value.toFixed(1)} / 10
                  </span>
                </div>
              ))}
            </div>
          )}
          {riskFlags.length > 0 && (
            <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-3">Risk Flags</h3>
              <ul className="space-y-2">
                {riskFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. Notable Moments */}
      {quoteHighlights.length > 0 && (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/10 via-gray-900/80 to-gray-950 p-8 shadow-xl shadow-blue-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Notable Moments</h2>
          </div>
          <div className="space-y-4">
            {quoteHighlights.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-3 border-l-blue-500 bg-blue-500/5 rounded-r-xl pl-5 pr-4 py-3 text-sm text-gray-300 italic leading-relaxed"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* 7. Thinking Trace */}
      {report.thinkingTrace && (
        <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 via-gray-900/80 to-gray-950 p-8 shadow-xl shadow-purple-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">AI Analysis</h2>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {report.thinkingTrace}
          </p>
        </div>
      )}

      {/* 8. Share Button */}
      <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-900/20 via-gray-900/80 to-blue-900/20 p-8 shadow-2xl shadow-purple-900/10 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Share Your Results</h2>
          </div>
          <p className="text-sm text-gray-400 mb-5 ml-11">
            Generate a shareable link to showcase your performance. The public view keeps sensitive details private.
          </p>
          <ShareReportButton
            sessionId={interviewSession.id}
            existingShareToken={report.shareToken}
          />
        </div>
      </div>
    </div>
  )
}
