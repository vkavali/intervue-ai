"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface PositionDetail {
  id: string
  title: string
  role: string
  seniority: string
  department: string | null
  location: string | null
  description: string | null
  requirements: string | null
  benefits: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  company: { id: string; name: string; logo: string | null; slug: string | null }
  createdAt: string
}

export default function JobDetailPage() {
  const params = useParams()
  const [position, setPosition] = useState<PositionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: "", email: "", phone: "", resumeUrl: "", coverLetter: "", linkedinUrl: "",
  })

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setPosition(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplying(true)
    setError("")
    try {
      const res = await fetch(`/api/jobs/${params.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setApplied(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <svg className="h-8 w-8 animate-spin text-saffron" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (!position) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900">Position Not Found</h1>
        <p className="mt-2 text-gray-500">This position may have been removed or is no longer open.</p>
        <Link href="/jobs" className="mt-4 text-saffron hover:text-saffron-dark">Back to all positions</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative text-lg font-bold text-gray-900 font-mono"><span className="absolute -top-2 -left-1 text-[7px] font-normal text-gray-400 font-sans">the</span>printf<span className="text-saffron">(</span><span className="text-india-green">)</span><span className="absolute -bottom-2 -right-1 text-[7px] font-normal text-gray-400 font-sans">.com</span></Link>
            <span className="text-gray-300">|</span>
            <Link href="/jobs" className="text-sm text-gray-500 hover:text-saffron">Job Board</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/jobs" className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-saffron">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to all positions
        </Link>

        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{position.title}</h1>
              <p className="mt-1 text-gray-500">
                {position.company.name}
                {position.location && ` \u00B7 ${position.location}`}
              </p>
            </div>
            {!applied && (
              <button
                onClick={() => setShowApplyForm(!showApplyForm)}
                className="rounded-lg border border-saffron bg-saffron px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark"
              >
                {showApplyForm ? "Cancel" : "Apply Now"}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-medium text-saffron-dark">
              {position.seniority}
            </span>
            {position.department && (
              <span className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {position.department}
              </span>
            )}
            {position.salaryMin && position.salaryMax && (
              <span className="rounded-full border border-india-green/30 bg-india-green/10 px-3 py-1 text-xs font-medium text-india-green-dark">
                {position.salaryCurrency || "USD"} {position.salaryMin.toLocaleString()}{"\u2013"}{position.salaryMax.toLocaleString()}
              </span>
            )}
          </div>

          {/* Application form */}
          {applied ? (
            <div className="mb-6 rounded-lg border border-india-green/30 bg-india-green/10 p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-india-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-3 text-lg font-semibold text-india-green-dark">Application Submitted!</h3>
              <p className="mt-1 text-sm text-gray-600">Thank you for applying. The hiring team will review your application.</p>
            </div>
          ) : showApplyForm && (
            <div className="mb-6 rounded-lg border border-saffron/30 bg-saffron/5 p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Apply for this position</h3>
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}
              <form onSubmit={handleApply} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">LinkedIn URL</label>
                    <input type="url" value={form.linkedinUrl} onChange={e => setForm({...form, linkedinUrl: e.target.value})}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Resume URL</label>
                  <input type="url" value={form.resumeUrl} onChange={e => setForm({...form, resumeUrl: e.target.value})}
                    placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Cover Letter</label>
                  <textarea value={form.coverLetter} onChange={e => setForm({...form, coverLetter: e.target.value})}
                    rows={4} placeholder="Why are you interested in this role?"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron resize-none"
                  />
                </div>
                <button type="submit" disabled={applying}
                  className="rounded-lg border border-saffron bg-saffron px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark disabled:opacity-50"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </form>
            </div>
          )}

          {/* Job details */}
          <div className="space-y-6">
            {position.description && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">About this role</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{position.description}</p>
              </div>
            )}
            {position.requirements && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Requirements</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{position.requirements}</p>
              </div>
            )}
            {position.benefits && (
              <div>
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500">Benefits</h3>
                <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{position.benefits}</p>
              </div>
            )}
          </div>

          {position.company.slug && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <Link href={`/jobs/company/${position.company.slug}`} className="text-sm text-saffron hover:text-saffron-dark">
                View all positions at {position.company.name} &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
