import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ScoreRing } from "@/components/ScoreRing"
import { MetricBar } from "@/components/MetricBar"
import { cache } from "react"
import type { Metadata } from "next"
import Link from "next/link"

const getAuditByToken = cache(async (token: string) => {
  return prisma.auditReport.findUnique({
    where: { shareToken: token },
    include: {
      session: {
        include: {
          candidate: { select: { name: true, id: true } },
          template: { select: { role: true, seniority: true, title: true } },
        },
      },
    },
  })
})

export async function generateMetadata({
  params,
}: {
  params: { token: string }
}): Promise<Metadata> {
  const audit = await getAuditByToken(params.token)

  if (!audit) {
    return { title: "Report Not Found | Intervue.AI" }
  }

  const name = audit.session.candidate.name
  const role = audit.session.template.role
  const score = audit.overallScore.toFixed(1)

  return {
    title: `${name} - ${role} Interview | Intervue.AI`,
    description: `${name} scored ${score}/100 in their ${role} interview on Intervue.AI`,
    openGraph: {
      title: `${name} - ${role} Interview Performance`,
      description: `Overall Score: ${score}/100 | Verified by Intervue.AI`,
      images: [
        {
          url: `/api/og/badge/${params.token}`,
          width: 1200,
          height: 630,
          alt: `${name}'s interview badge`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - ${role} Interview Performance`,
      description: `Overall Score: ${score}/100 | Verified by Intervue.AI`,
      images: [`/api/og/badge/${params.token}`],
    },
  }
}

export default async function InsightPage({
  params,
}: {
  params: { token: string }
}) {
  const audit = await getAuditByToken(params.token)

  if (!audit) {
    notFound()
  }

  const candidateName = audit.session.candidate.name
  const candidateId = audit.session.candidate.id
  const role = audit.session.template.role
  const seniority = audit.session.template.seniority

  let quoteHighlights: string[] = []
  try { quoteHighlights = JSON.parse(audit.quoteHighlights) } catch {}

  const metrics = [
    { label: "Problem Comprehension", value: audit.problemComprehension },
    { label: "Solution Correctness", value: audit.solutionCorrectness },
    { label: "Code Quality", value: audit.codeQuality },
    { label: "Communication", value: audit.communication },
    { label: "AI Usage Quality", value: audit.aiUsageQuality },
    { label: "Time Management", value: audit.timeManagement },
  ]

  const strengths = metrics.filter((m) => m.value >= 7)

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-saffron/8 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-60 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-4 py-1.5 text-sm text-saffron-dark backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-saffron" />
            </span>
            Verified Interview Report
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {candidateName}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-india-green/10 px-3 py-1 text-sm text-india-green">
              {role}
            </span>
            <span className="inline-flex items-center rounded-full border border-saffron/20 bg-saffron/10 px-3 py-1 text-sm text-saffron">
              {seniority}
            </span>
          </div>
        </div>

        {/* Score Overview */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-saffron/10 to-transparent rounded-full blur-2xl scale-150" />
            <ScoreRing score={audit.overallScore} size={180} strokeWidth={12} />
          </div>
        </div>

        {/* Metric Bars */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-900/80 to-gray-950 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Performance Breakdown</h2>
          </div>
          <div className="space-y-5">
            {metrics.map((m) => (
              <MetricBar key={m.label} label={m.label} value={m.value} />
            ))}
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-900/10 via-gray-900/80 to-gray-950 p-8 shadow-sm shadow-green-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Strengths</h2>
            </div>
            <div className="space-y-3">
              {strengths.map((s) => (
                <div key={s.label} className="flex items-center justify-between rounded-xl bg-green-500/5 border border-green-500/10 p-4">
                  <span className="text-sm font-medium text-gray-200">{s.label}</span>
                  <span className="text-sm font-bold text-green-400">{s.value.toFixed(1)} / 10</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote Highlights */}
        {quoteHighlights.length > 0 && (
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/10 via-gray-900/80 to-gray-950 p-8 shadow-sm shadow-blue-900/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Notable Moments</h2>
            </div>
            <div className="space-y-4">
              {quoteHighlights.map((quote, i) => (
                <blockquote
                  key={i}
                  className="border-l-3 border-l-blue-500 bg-blue-500/5 rounded-r-xl pl-5 pr-4 py-3 text-sm text-gray-700 italic leading-relaxed"
                >
                  &ldquo;{quote}&rdquo;
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {/* View Profile Link */}
        <div className="text-center">
          <Link
            href={`/talent/${candidateId}`}
            className="inline-flex items-center gap-2 text-sm text-saffron hover:text-saffron-dark transition-colors group"
          >
            View full talent profile
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* CTA Footer */}
        <div className="relative rounded-2xl border border-saffron/20 bg-gradient-to-r from-saffron-dark/30 via-gray-900/80 to-india-green-dark/30 p-10 text-center shadow-2xl shadow-saffron-dark/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-saffron/5 via-transparent to-india-green/5" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-gradient-to-b from-saffron/10 to-transparent rounded-full blur-3xl" />
          <div className="relative">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Intervue<span className="text-india-green">.AI</span>
            </span>
            <p className="mt-3 text-gray-500 max-w-md mx-auto">
              AI-powered technical interviews with real-time assessment and detailed performance insights.
            </p>
            <Link
              href="/auth/signup?role=candidate"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron to-india-green px-8 py-3.5 text-base font-semibold text-gray-900 shadow-2xl shadow-saffron/25 transition-all hover:shadow-saffron/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Your Own Report
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
