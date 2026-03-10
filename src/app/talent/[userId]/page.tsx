import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ScoreRing } from "@/components/ScoreRing"
import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"

const getTalentProfile = cache(async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId, role: "CANDIDATE", profilePublic: true },
    select: { id: true, name: true, createdAt: true },
  })

  if (!user) return null

  // Only sessions with shared audit reports
  const sessions = await prisma.interviewSession.findMany({
    where: {
      candidateId: userId,
      status: "COMPLETED",
      auditReport: { shareToken: { not: null } },
    },
    include: {
      template: { select: { role: true, seniority: true } },
      auditReport: {
        select: {
          overallScore: true,
          shareToken: true,
          problemComprehension: true,
          solutionCorrectness: true,
          codeQuality: true,
          communication: true,
          aiUsageQuality: true,
          timeManagement: true,
        },
      },
    },
    orderBy: { endedAt: "desc" },
  })

  return { user, sessions }
})

export async function generateMetadata({
  params,
}: {
  params: { userId: string }
}): Promise<Metadata> {
  const data = await getTalentProfile(params.userId)

  if (!data) {
    return { title: "Profile Not Found | Intervue.AI" }
  }

  const avgScore = data.sessions.length > 0
    ? data.sessions.reduce((sum, s) => sum + (s.auditReport?.overallScore ?? 0), 0) / data.sessions.length
    : 0

  return {
    title: `${data.user.name} - Talent Profile | Intervue.AI`,
    description: `${data.user.name} has completed ${data.sessions.length} verified interviews with an average score of ${avgScore.toFixed(1)}/100`,
  }
}

function getProficiencyLevel(avgScore: number): { label: string; color: string; gradient: string } {
  if (avgScore >= 85) return { label: "Expert", color: "text-green-400", gradient: "from-green-500 to-emerald-500" }
  if (avgScore >= 70) return { label: "Advanced", color: "text-blue-400", gradient: "from-blue-500 to-cyan-500" }
  if (avgScore >= 50) return { label: "Intermediate", color: "text-yellow-400", gradient: "from-yellow-500 to-amber-500" }
  return { label: "Beginner", color: "text-gray-400", gradient: "from-gray-500 to-gray-600" }
}

export default async function TalentProfilePage({
  params,
}: {
  params: { userId: string }
}) {
  const data = await getTalentProfile(params.userId)

  if (!data) {
    notFound()
  }

  const { user, sessions } = data

  const avgScore = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + (s.auditReport?.overallScore ?? 0), 0) / sessions.length
    : 0

  const proficiency = getProficiencyLevel(avgScore)

  // Find top skill across all sessions
  const getMetricAverages = () => {
    if (sessions.length === 0) return []
    const entries: { label: string; avg: number }[] = [
      { label: "Problem Comprehension", avg: sessions.reduce((s, x) => s + (x.auditReport?.problemComprehension ?? 0), 0) / sessions.length },
      { label: "Solution Correctness", avg: sessions.reduce((s, x) => s + (x.auditReport?.solutionCorrectness ?? 0), 0) / sessions.length },
      { label: "Code Quality", avg: sessions.reduce((s, x) => s + (x.auditReport?.codeQuality ?? 0), 0) / sessions.length },
      { label: "Communication", avg: sessions.reduce((s, x) => s + (x.auditReport?.communication ?? 0), 0) / sessions.length },
      { label: "AI Usage", avg: sessions.reduce((s, x) => s + (x.auditReport?.aiUsageQuality ?? 0), 0) / sessions.length },
      { label: "Time Management", avg: sessions.reduce((s, x) => s + (x.auditReport?.timeManagement ?? 0), 0) / sessions.length },
    ]
    return entries.sort((a, b) => b.avg - a.avg)
  }
  const metricAverages = getMetricAverages()
  const topSkill = metricAverages[0]

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-saffron/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 py-16 space-y-10">
        {/* 1. Header */}
        <div className="text-center space-y-5">
          <div className="relative inline-block">
            <div className={`absolute inset-0 bg-gradient-to-br ${proficiency.gradient} rounded-full blur-xl opacity-30 scale-125`} />
            <div className={`relative h-20 w-20 rounded-full bg-gradient-to-br ${proficiency.gradient} flex items-center justify-center text-3xl font-bold text-white shadow-2xl mx-auto`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {user.name}
          </h1>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${proficiency.gradient} px-4 py-1.5 text-sm font-semibold text-white shadow-lg`}>
              {proficiency.label}
            </span>
            <span className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* 2. Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="group rounded-2xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-gray-900/80 p-6 text-center shadow-xl transition-all hover:scale-[1.03] hover:-translate-y-1 hover:shadow-blue-900/20">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-blue-400">{sessions.length}</p>
            <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">Verified Interviews</p>
          </div>
          <div className="group rounded-2xl border border-saffron/20 bg-gradient-to-b from-saffron/10 to-gray-900/80 p-6 text-center shadow-xl transition-all hover:scale-[1.03] hover:-translate-y-1 hover:shadow-saffron-dark/20">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-saffron to-india-green flex items-center justify-center mx-auto mb-3 shadow-lg shadow-saffron/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-saffron">{avgScore > 0 ? avgScore.toFixed(1) : "--"}</p>
            <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">Average Score</p>
          </div>
          <div className="group rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/10 to-gray-900/80 p-6 text-center shadow-xl transition-all hover:scale-[1.03] hover:-translate-y-1 hover:shadow-green-900/20">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-green-400 truncate">{topSkill?.label || "--"}</p>
            <p className="mt-1 text-xs text-gray-500 uppercase tracking-wider">Top Skill</p>
          </div>
        </div>

        {/* 3. Badge Grid */}
        {sessions.length > 0 ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-saffron-light to-india-green-light flex items-center justify-center shadow-lg shadow-saffron/20">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Interview Badges</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.map((s) => {
                const report = s.auditReport
                if (!report?.shareToken) return null

                const scoreColor =
                  report.overallScore >= 80 ? "border-green-500/30 hover:border-green-500/50" :
                  report.overallScore >= 60 ? "border-yellow-500/30 hover:border-yellow-500/50" :
                  report.overallScore >= 40 ? "border-orange-500/30 hover:border-orange-500/50" : "border-red-500/30 hover:border-red-500/50"

                const scoreGradient =
                  report.overallScore >= 80 ? "from-green-900/10" :
                  report.overallScore >= 60 ? "from-yellow-900/10" :
                  report.overallScore >= 40 ? "from-orange-900/10" : "from-red-900/10"

                return (
                  <Link
                    key={s.id}
                    href={`/insight/${report.shareToken}`}
                    className={`group rounded-2xl border ${scoreColor} bg-gradient-to-b ${scoreGradient} to-gray-900/80 p-6 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-base font-semibold text-white group-hover:bg-gradient-to-r group-hover:from-saffron group-hover:to-india-green group-hover:bg-clip-text group-hover:text-transparent transition-all">
                          {s.template.role}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.template.seniority}</p>
                      </div>
                      <ScoreRing score={report.overallScore} size={60} strokeWidth={5} showLabel={false} />
                    </div>
                    {s.endedAt && (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(s.endedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <svg className="w-4 h-4 text-gray-600 group-hover:text-saffron transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/80 to-gray-950 p-12 text-center shadow-xl">
            <div className="h-12 w-12 rounded-xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-gray-400">No shared interview badges yet.</p>
          </div>
        )}

        {/* CTA Footer */}
        <div className="relative rounded-2xl border border-saffron/20 bg-gradient-to-r from-saffron-dark/30 via-gray-900/80 to-india-green-dark/30 p-10 text-center shadow-2xl shadow-saffron-dark/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-transparent to-india-green/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-saffron/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-2xl font-bold text-white">Build Your Own Talent Profile</p>
            <p className="mt-3 text-gray-400 max-w-md mx-auto">
              Showcase your interview performance with verified AI assessments and share with recruiters worldwide.
            </p>
            <Link
              href="/auth/signup"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-india-green px-8 py-3.5 text-base font-semibold text-white shadow-2xl shadow-saffron/25 transition-all hover:shadow-saffron/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign Up Free
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
