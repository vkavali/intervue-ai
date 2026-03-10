"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CreateSessionPage() {
  const params = useParams();
  const templateId = params.id as string;

  const [candidateEmail, setCandidateEmail] = useState("");
  const [interviewerEmail, setInterviewerEmail] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ sessionId: string; sessionLink: string } | null>(null);

  // Fetch template info for display
  const [template, setTemplate] = useState<{
    title: string;
    role: string;
    seniority: string;
    roundType: string;
    defaultAiLevel: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/templates/${templateId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTemplate(data);
      })
      .catch(() => {});
  }, [templateId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!candidateEmail.trim()) {
      setError("Candidate email is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(null);

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          candidateEmail: candidateEmail.trim(),
          interviewerEmail: interviewerEmail.trim() || undefined,
          scheduledAt: scheduledAt || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create session.");
      } else {
        setSuccess({
          sessionId: data.id,
          sessionLink: data.sessionLink || `/session/${data.id}`,
        });
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={`/dashboard/interviews/${templateId}`}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            &larr; Back to Template
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create Interview Session</h1>
        <p className="mt-1 text-gray-500">
          Schedule an interview session using this template.
        </p>
      </div>

      {/* Template Info */}
      {template && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Template</h2>
          <div className="flex items-center gap-4">
            <p className="text-lg font-semibold text-gray-900">{template.title}</p>
            <span className="text-sm text-gray-500">{template.role}</span>
            <span className="text-xs text-gray-500">{template.seniority}</span>
            <span className="text-xs text-gray-500">{template.roundType}</span>
            <span className="inline-flex items-center rounded-full bg-saffron/10 border border-saffron/30 px-2 py-0.5 text-xs text-saffron">
              L{template.defaultAiLevel}
            </span>
          </div>
        </div>
      )}

      {/* Success State */}
      {success ? (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Created!</h2>
          <p className="text-gray-500 mb-6">
            The interview session has been created. Share the session link with the candidate.
          </p>

          <div className="rounded-lg bg-gray-100 border border-gray-200 p-4 mb-6 max-w-lg mx-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1">Session Link</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-saffron-dark break-all">
                {typeof window !== "undefined" ? window.location.origin : ""}{success.sessionLink}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${success.sessionLink}`
                  );
                }}
                className="shrink-0 rounded border border-saffron bg-transparent px-3 py-1.5 text-xs font-medium text-saffron hover:bg-saffron/10"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link
              href="/dashboard/sessions"
              className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-200 transition-colors"
            >
              View All Sessions
            </Link>
            <button
              onClick={() => {
                setSuccess(null);
                setCandidateEmail("");
                setInterviewerEmail("");
                setScheduledAt("");
              }}
              className="rounded-lg border border-saffron bg-transparent px-5 py-2.5 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
            >
              Create Another
            </button>
          </div>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="max-w-2xl">
          <div className="space-y-6">
            {/* Candidate Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Candidate Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                required
                placeholder="candidate@example.com"
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
              <p className="mt-1 text-xs text-gray-500">
                If the candidate doesn&apos;t have an account, one will be created automatically.
              </p>
            </div>

            {/* Interviewer Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Interviewer Email <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="email"
                value={interviewerEmail}
                onChange={(e) => setInterviewerEmail(e.target.value)}
                placeholder="interviewer@yourcompany.com"
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
              <p className="mt-1 text-xs text-gray-500">
                Assign an interviewer to watch and evaluate the session in real-time.
              </p>
            </div>

            {/* Scheduled Date/Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Scheduled Date & Time <span className="text-gray-500">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron [color-scheme:dark]"
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to allow the candidate to start immediately.
              </p>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-6 py-2.5 text-sm font-semibold text-saffron-dark hover:bg-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create Session
                  </>
                )}
              </button>
              <Link
                href={`/dashboard/interviews/${templateId}`}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
