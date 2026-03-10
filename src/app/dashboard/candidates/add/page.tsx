"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SENIORITY_OPTIONS = [
  "JUNIOR",
  "MID",
  "SENIOR",
  "STAFF",
  "PRINCIPAL",
];

const STAGE_OPTIONS = [
  "SCREENING",
  "TECHNICAL",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
  "FINAL",
];

export default function AddCandidatePage() {
  const router = useRouter();

  const [mode, setMode] = useState<"search" | "new">("search");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedOnce, setSearchedOnce] = useState(false);

  // New candidate fields
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");

  // Pipeline fields
  const [role, setRole] = useState("");
  const [seniority, setSeniority] = useState("MID");
  const [stage, setStage] = useState("SCREENING");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSearch() {
    if (!searchEmail.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    setSearchedOnce(true);

    try {
      const res = await fetch(
        `/api/users/search?email=${encodeURIComponent(searchEmail.trim())}`
      );

      if (res.ok) {
        const data = await res.json();
        if (data && data.id) {
          setSearchResult(data);
        } else {
          setSearchError("No candidate found with that email.");
        }
      } else if (res.status === 404) {
        setSearchError(
          "No candidate found with that email. You can add them as a new candidate below."
        );
      } else {
        const data = await res.json();
        setSearchError(data.error || "Search failed.");
      }
    } catch {
      setSearchError("An unexpected error occurred during search.");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!role.trim()) {
      setSubmitError("Role is required.");
      return;
    }

    if (mode === "search" && !searchResult) {
      setSubmitError(
        "Please search for and select a candidate first, or switch to adding a new one."
      );
      return;
    }

    if (mode === "new" && (!candidateName.trim() || !candidateEmail.trim())) {
      setSubmitError("Name and email are required for new candidates.");
      return;
    }

    setSubmitting(true);

    try {
      // Build the request body - the pipeline API supports both candidateId and candidateEmail/candidateName
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: Record<string, any> = {
        role: role.trim(),
        seniority,
        stage,
      };

      if (mode === "search" && searchResult) {
        body.candidateId = searchResult.id;
      } else if (mode === "new") {
        body.candidateEmail = candidateEmail.trim();
        body.candidateName = candidateName.trim();
      }

      const pipelineRes = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!pipelineRes.ok) {
        const data = await pipelineRes.json();
        setSubmitError(data.error || "Failed to add candidate to pipeline.");
        setSubmitting(false);
        return;
      }

      // Success - redirect
      router.push("/dashboard/candidates");
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Breadcrumb + Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link
            href="/dashboard/candidates"
            className="hover:text-saffron transition-colors"
          >
            Candidates
          </Link>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-300">Add to Pipeline</span>
        </div>

        <h1 className="text-2xl font-bold text-white">Add Candidate to Pipeline</h1>
        <p className="mt-1 text-sm text-gray-400">
          Search for an existing candidate or add a new one to your hiring pipeline.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* Mode Tabs */}
          <div className="mb-6 flex rounded-lg border border-gray-800 bg-gray-900 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("search");
                setSubmitError(null);
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "search"
                  ? "bg-saffron text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Search Existing Candidate
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("new");
                setSubmitError(null);
              }}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                mode === "new"
                  ? "bg-saffron text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              New Candidate
            </button>
          </div>

          {/* Search Mode */}
          {mode === "search" && (
            <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Search by Email
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchLoading || !searchEmail.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
                >
                  {searchLoading ? (
                    <svg
                      className="h-4 w-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  )}
                  Search
                </button>
              </div>

              {/* Search Result */}
              {searchResult && (
                <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/5 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-sm font-medium text-green-400">
                    {searchResult.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {searchResult.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {searchResult.email}
                    </p>
                  </div>
                  <svg
                    className="ml-auto h-5 w-5 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Search Error */}
              {searchError && searchedOnce && (
                <p className="mt-3 text-xs text-yellow-400">{searchError}</p>
              )}
            </div>
          )}

          {/* New Candidate Mode */}
          {mode === "new" && (
            <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
                />
              </div>
            </div>
          )}

          {/* Pipeline Details */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">
              Pipeline Details
            </h3>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, Backend Engineer, Full Stack Developer"
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              >
                {SENIORITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Initial Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-2.5 text-sm text-white focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              >
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">{submitError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/candidates"
              className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-saffron px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-saffron disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </>
              ) : (
                "Add to Pipeline"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
