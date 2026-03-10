"use client"

import { useState } from "react"

interface ShareReportButtonProps {
  sessionId: string
  existingShareToken: string | null
}

export function ShareReportButton({ sessionId, existingShareToken }: ShareReportButtonProps) {
  const [shareToken, setShareToken] = useState<string | null>(existingShareToken)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/insight/${shareToken}`
    : null

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        setShareToken(data.shareToken)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke() {
    setLoading(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, { method: "DELETE" })
      if (res.ok) {
        setShareToken(null)
        setCopied(false)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCopy() {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const linkedInUrl = shareUrl
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    : null

  const twitterUrl = shareUrl
    ? `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Check out my interview performance on Intervue.AI!")}`
    : null

  if (!shareToken) {
    return (
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-5 py-2.5 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        {loading ? "Generating..." : "Share My Results"}
      </button>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={shareUrl || ""}
          className="flex-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 font-mono"
        />
        <button
          onClick={handleCopy}
          className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-700 hover:text-gray-900 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {linkedInUrl && (
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#0077B5] px-4 py-2 text-sm font-medium text-gray-900 hover:bg-[#006097] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        )}

        {twitterUrl && (
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Twitter / X
          </a>
        )}

        <button
          onClick={handleRevoke}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-accent-red/30 px-4 py-2 text-sm font-medium text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-50"
        >
          Revoke Link
        </button>
      </div>
    </div>
  )
}
