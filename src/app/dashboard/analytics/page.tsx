import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

const aiLevelLabels: Record<number, string> = {
  0: 'L0 - Locked',
  1: 'L1 - Socratic Hints',
  2: 'L2 - Scaffold',
  3: 'L3 - Guide',
  4: 'L4 - Copilot',
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500', bg: 'bg-yellow-500/10 text-yellow-400' },
  ACTIVE: { label: 'Active', color: 'bg-blue-500', bg: 'bg-india-green/10 text-india-green' },
  COMPLETED: { label: 'Completed', color: 'bg-green-500', bg: 'bg-green-500/10 text-green-400' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500', bg: 'bg-red-500/10 text-red-400' },
}

function getMonthLabel(date: Date): string {
  return date.toLocaleString('default', { month: 'short', year: 'numeric' })
}

function getLast6Months(): { year: number; month: number; label: string }[] {
  const months = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: getMonthLabel(d),
    })
  }
  return months
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin?callbackUrl=/dashboard/analytics')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!user?.companyId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">No Company Associated</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your account is not linked to a company. Please contact an administrator.
          </p>
        </div>
      </div>
    )
  }

  const companyId = user.companyId

  // ── Fetch all sessions with related data ──────────────────────────────────
  const sessions = await prisma.interviewSession.findMany({
    where: { companyId },
    include: {
      candidate: { select: { name: true, email: true } },
      interviewer: { select: { id: true, name: true, email: true } },
      template: { select: { id: true, title: true, defaultAiLevel: true } },
      auditReport: {
        select: {
          overallScore: true,
          suggestedDecision: true,
        },
      },
      aiInteractions: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // ── Fetch AI interaction count ────────────────────────────────────────────
  const totalAiInteractions = await prisma.aIInteraction.count({
    where: { session: { companyId } },
  })

  // ── 1. Stats Row ──────────────────────────────────────────────────────────
  const totalInterviews = sessions.length
  const nonPendingSessions = sessions.filter((s) => s.status !== 'PENDING')
  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED')
  const completionRate =
    nonPendingSessions.length > 0
      ? (completedSessions.length / nonPendingSessions.length) * 100
      : 0

  const reportsWithScores = sessions
    .filter((s) => s.auditReport)
    .map((s) => s.auditReport!)

  const averageScore =
    reportsWithScores.length > 0
      ? reportsWithScores.reduce((sum, r) => sum + r.overallScore, 0) / reportsWithScores.length
      : 0

  const hireCount = reportsWithScores.filter(
    (r) => r.suggestedDecision === 'HIRE'
  ).length
  const hireRate =
    reportsWithScores.length > 0 ? (hireCount / reportsWithScores.length) * 100 : 0

  // ── 2. Score Distribution ─────────────────────────────────────────────────
  const scoreRanges = [
    { label: '0-20', min: 0, max: 20, count: 0 },
    { label: '21-40', min: 21, max: 40, count: 0 },
    { label: '41-60', min: 41, max: 60, count: 0 },
    { label: '61-80', min: 61, max: 80, count: 0 },
    { label: '81-100', min: 81, max: 100, count: 0 },
  ]

  for (const report of reportsWithScores) {
    const score = report.overallScore
    for (const range of scoreRanges) {
      if (score >= range.min && score <= range.max) {
        range.count++
        break
      }
    }
  }

  const maxScoreCount = Math.max(...scoreRanges.map((r) => r.count), 1)

  // ── 3. Interviews by Status ───────────────────────────────────────────────
  const statusCounts: Record<string, number> = {
    PENDING: 0,
    ACTIVE: 0,
    COMPLETED: 0,
    CANCELLED: 0,
  }
  for (const s of sessions) {
    if (s.status in statusCounts) {
      statusCounts[s.status]++
    }
  }
  const maxStatusCount = Math.max(...Object.values(statusCounts), 1)

  // ── 4. AI Level Usage ─────────────────────────────────────────────────────
  const aiLevelCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 }
  for (const s of sessions) {
    const level = s.aiLevel
    if (level >= 0 && level <= 4) {
      aiLevelCounts[level]++
    }
  }
  const maxAiLevelCount = Math.max(...Object.values(aiLevelCounts), 1)

  // ── 5. Top Performing Questions (by template) ─────────────────────────────
  const templateScores: Record<string, { title: string; scores: number[] }> = {}
  for (const s of sessions) {
    if (s.auditReport && s.template) {
      const tid = s.template.id
      if (!templateScores[tid]) {
        templateScores[tid] = { title: s.template.title, scores: [] }
      }
      templateScores[tid].scores.push(s.auditReport.overallScore)
    }
  }

  const topTemplates = Object.entries(templateScores)
    .map(([id, data]) => ({
      id,
      title: data.title,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      count: data.scores.length,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5)

  // ── 6. Interviewer Leaderboard ────────────────────────────────────────────
  const interviewerMap: Record<
    string,
    { name: string; totalSessions: number; scores: number[]; completed: number }
  > = {}

  for (const s of sessions) {
    if (s.interviewer) {
      const iid = s.interviewer.id
      if (!interviewerMap[iid]) {
        interviewerMap[iid] = {
          name: s.interviewer.name,
          totalSessions: 0,
          scores: [],
          completed: 0,
        }
      }
      interviewerMap[iid].totalSessions++
      if (s.status === 'COMPLETED') {
        interviewerMap[iid].completed++
      }
      if (s.auditReport) {
        interviewerMap[iid].scores.push(s.auditReport.overallScore)
      }
    }
  }

  const interviewerLeaderboard = Object.entries(interviewerMap)
    .map(([id, data]) => ({
      id,
      name: data.name,
      sessions: data.totalSessions,
      avgScore:
        data.scores.length > 0
          ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
          : null,
      completionRate:
        data.totalSessions > 0
          ? (data.completed / data.totalSessions) * 100
          : 0,
    }))
    .sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))

  // ── 7. Monthly Trends (last 6 months) ─────────────────────────────────────
  const last6 = getLast6Months()
  const monthlyData = last6.map((m) => {
    const monthSessions = sessions.filter((s) => {
      const d = new Date(s.createdAt)
      return d.getFullYear() === m.year && d.getMonth() === m.month
    })
    const monthReports = monthSessions
      .filter((s) => s.auditReport)
      .map((s) => s.auditReport!)
    const avgScore =
      monthReports.length > 0
        ? monthReports.reduce((sum, r) => sum + r.overallScore, 0) / monthReports.length
        : 0
    return {
      label: m.label,
      count: monthSessions.length,
      avgScore,
    }
  })
  const maxMonthlyCount = Math.max(...monthlyData.map((m) => m.count), 1)

  // ── 8. AI Assist Effectiveness ────────────────────────────────────────────
  const lowAiSessions = sessions.filter(
    (s) => s.aiLevel <= 2 && s.auditReport
  )
  const highAiSessions = sessions.filter(
    (s) => s.aiLevel >= 3 && s.auditReport
  )

  const lowAiAvg =
    lowAiSessions.length > 0
      ? lowAiSessions.reduce((sum, s) => sum + s.auditReport!.overallScore, 0) /
        lowAiSessions.length
      : 0
  const highAiAvg =
    highAiSessions.length > 0
      ? highAiSessions.reduce((sum, s) => sum + s.auditReport!.overallScore, 0) /
        highAiSessions.length
      : 0

  const aiDiffPercent =
    lowAiAvg > 0 ? (((highAiAvg - lowAiAvg) / lowAiAvg) * 100).toFixed(1) : null

  // ── 9. AI Interactions stats ──────────────────────────────────────────────
  const sessionsWithAi = sessions.filter((s) => s.aiInteractions.length > 0).length
  const avgAiPerSession =
    sessionsWithAi > 0 ? totalAiInteractions / sessions.length : 0

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Company-wide interview performance and insights
        </p>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Interviews */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Interviews</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{totalInterviews}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-saffron to-india-green text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completion Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {completedSessions.length} completed of {nonPendingSessions.length} non-pending
          </p>
        </div>

        {/* Average Score */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Score</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-saffron to-saffron-dark text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Across {reportsWithScores.length} audit reports
          </p>
        </div>

        {/* Hire Rate */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hire Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{hireRate.toFixed(1)}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-india-green to-india-green-dark text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {hireCount} hire recommendations
          </p>
        </div>
      </div>

      {/* ── Charts Section ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score Distribution */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Score Distribution</h3>
          <div className="space-y-4">
            {scoreRanges.map((range) => (
              <div key={range.label} className="flex items-center gap-4">
                <span className="w-14 text-sm text-gray-500 text-right shrink-0">
                  {range.label}
                </span>
                <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-saffron to-india-green rounded-lg transition-all duration-500"
                    style={{
                      width: `${maxScoreCount > 0 ? (range.count / maxScoreCount) * 100 : 0}%`,
                      minWidth: range.count > 0 ? '2rem' : '0',
                    }}
                  />
                  {range.count > 0 && (
                    <span className="absolute inset-y-0 left-3 flex items-center text-xs font-medium text-gray-900">
                      {range.count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {reportsWithScores.length === 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              No audit reports available yet
            </p>
          )}
        </div>

        {/* Interviews by Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Interviews by Status</h3>
          <div className="flex items-end gap-4 h-48">
            {Object.entries(statusCounts).map(([status, count]) => {
              const config = statusConfig[status]
              const heightPercent = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0
              return (
                <div key={status} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '140px' }}>
                    <div
                      className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${config.color}`}
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: count > 0 ? '8px' : '0',
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 text-center">{config.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI Level Usage */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Level Usage</h3>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((level) => {
              const count = aiLevelCounts[level]
              const widthPercent = maxAiLevelCount > 0 ? (count / maxAiLevelCount) * 100 : 0
              const colors = [
                'from-gray-600 to-gray-500',
                'from-blue-700 to-blue-500',
                'from-blush to-blush-dark',
                'from-saffron to-india-green',
                'from-violet-600 to-fuchsia-500',
              ]
              return (
                <div key={level} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-500 shrink-0">
                    {aiLevelLabels[level]}
                  </span>
                  <div className="flex-1 h-7 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div
                      className={`h-full bg-gradient-to-r ${colors[level]} rounded-lg transition-all duration-500`}
                      style={{
                        width: `${widthPercent}%`,
                        minWidth: count > 0 ? '2rem' : '0',
                      }}
                    />
                    {count > 0 && (
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-medium text-gray-900">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Performing Questions (Templates) */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Questions</h3>
          {topTemplates.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No completed sessions with audit reports yet
            </p>
          ) : (
            <div className="space-y-3">
              {topTemplates.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-saffron/20 text-xs font-bold text-saffron">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.title}</p>
                      <p className="text-xs text-gray-500">{t.count} session{t.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{t.avgScore.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Interviewer Leaderboard ────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 bg-white mb-8 overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Interviewer Leaderboard</h3>
        </div>
        {interviewerLeaderboard.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">No interviewer data available yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sessions Conducted
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Avg Candidate Score
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {interviewerLeaderboard.map((interviewer, i) => (
                  <tr key={interviewer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                          i === 0
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : i === 1
                              ? 'bg-gray-400/20 text-gray-700'
                              : i === 2
                                ? 'bg-amber-700/20 text-amber-500'
                                : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {interviewer.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">
                      {interviewer.sessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {interviewer.avgScore !== null ? (
                        <span className="text-sm font-semibold text-gray-900">
                          {interviewer.avgScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">--</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                            style={{ width: `${interviewer.completionRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-700">
                          {interviewer.completionRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Monthly Trends & AI Insights Row ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Interview Trends */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Interview Trends</h3>
          <p className="text-xs text-gray-500 mb-4">Last 6 months</p>

          {/* Simple bar chart */}
          <div className="flex items-end gap-3 h-40 mb-4">
            {monthlyData.map((m) => {
              const heightPercent =
                maxMonthlyCount > 0 ? (m.count / maxMonthlyCount) * 100 : 0
              return (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-gray-900">{m.count}</span>
                  <div
                    className="w-full bg-gray-100 rounded-t-lg relative"
                    style={{ height: '110px' }}
                  >
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-saffron to-india-green transition-all duration-500"
                      style={{
                        height: `${heightPercent}%`,
                        minHeight: m.count > 0 ? '6px' : '0',
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 text-center leading-tight">
                    {m.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Table below */}
          <div className="border-t border-gray-200 pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-xs">
                  <th className="text-left pb-2">Month</th>
                  <th className="text-center pb-2">Interviews</th>
                  <th className="text-right pb-2">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m) => (
                  <tr key={m.label} className="border-t border-gray-200/50">
                    <td className="py-1.5 text-gray-700">{m.label}</td>
                    <td className="py-1.5 text-center text-gray-700">{m.count}</td>
                    <td className="py-1.5 text-right text-gray-700">
                      {m.count > 0 ? m.avgScore.toFixed(1) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Insights */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">AI Insights</h3>

          {/* AI Assist Effectiveness */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5 mb-5">
            <h4 className="text-sm font-medium text-gray-700 mb-3">AI Assist Effectiveness</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">L0-L2 Avg Score</p>
                <p className="text-xl font-bold text-gray-900">
                  {lowAiSessions.length > 0 ? lowAiAvg.toFixed(1) : '--'}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {lowAiSessions.length} session{lowAiSessions.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">L3-L4 Avg Score</p>
                <p className="text-xl font-bold text-gray-900">
                  {highAiSessions.length > 0 ? highAiAvg.toFixed(1) : '--'}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {highAiSessions.length} session{highAiSessions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {aiDiffPercent !== null && lowAiSessions.length > 0 && highAiSessions.length > 0 ? (
              <div
                className={`rounded-lg p-3 text-center ${
                  parseFloat(aiDiffPercent) >= 0
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <p className="text-sm text-gray-700">
                  Candidates with{' '}
                  <span className="font-semibold text-saffron">L3+ AI</span> scored{' '}
                  <span
                    className={`font-bold ${
                      parseFloat(aiDiffPercent) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {parseFloat(aiDiffPercent) >= 0 ? '+' : ''}
                    {aiDiffPercent}%
                  </span>{' '}
                  {parseFloat(aiDiffPercent) >= 0 ? 'higher' : 'lower'} on average
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 text-center">
                Insufficient data to compare AI levels
              </p>
            )}
          </div>

          {/* AI Interaction Stats */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <h4 className="text-sm font-medium text-gray-700 mb-4">AI Interaction Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{totalAiInteractions.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total AI Interactions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{avgAiPerSession.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-1">Avg per Session</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-2 w-2 rounded-full bg-saffron animate-pulse" />
              <p className="text-xs text-gray-500">
                {sessionsWithAi} of {sessions.length} sessions used AI assist
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
