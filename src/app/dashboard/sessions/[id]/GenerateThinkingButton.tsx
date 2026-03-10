"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function GenerateThinkingButton({
  sessionId,
  label,
}: {
  sessionId: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/thinking`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to generate analysis");
        return;
      }

      router.refresh();
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-xs text-red-400">{error}</span>
      )}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-saffron to-india-green px-4 py-2 text-sm font-semibold text-white transition-all hover:from-saffron-light hover:to-india-green-light disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            {label}
          </>
        )}
      </button>
    </div>
  );
}
