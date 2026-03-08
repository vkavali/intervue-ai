"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Position {
  id: string;
  title: string;
  role: string;
  seniority: string;
  department: string | null;
  location: string | null;
  description: string | null;
  headcount: number;
  status: string;
  candidateCount: number;
  createdAt: string;
}

const SENIORITY_OPTIONS = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
const STATUS_OPTIONS = ["OPEN", "PAUSED", "CLOSED", "FILLED"];

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  OPEN: { label: "Open", bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  PAUSED: { label: "Paused", bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  CLOSED: { label: "Closed", bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
  FILLED: { label: "Filled", bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
};

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    role: "",
    seniority: "MID",
    department: "",
    location: "",
    description: "",
    headcount: "1",
  });

  const fetchPositions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data = await res.json();
        setPositions(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create position");
      }
      setForm({ title: "", role: "", seniority: "MID", department: "", location: "", description: "", headcount: "1" });
      setShowForm(false);
      await fetchPositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/positions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchPositions();
      }
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    try {
      const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchPositions();
      }
    } catch {
      // silently fail
    }
  };

  const openCount = positions.filter((p) => p.status === "OPEN").length;
  const filledCount = positions.filter((p) => p.status === "FILLED").length;
  const totalHeadcount = positions.filter((p) => p.status === "OPEN").reduce((sum, p) => sum + p.headcount, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Open Positions</h1>
          <p className="mt-1 text-sm text-gray-400">Track active hiring needs and job requisitions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Position
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Open Positions</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{openCount}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total Headcount Needed</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalHeadcount}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Filled</p>
          <p className="mt-1 text-2xl font-bold text-blue-400">{filledCount}</p>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">New Position</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Role *</label>
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g. Frontend Engineer"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Seniority *</label>
                <select
                  value={form.seniority}
                  onChange={(e) => setForm({ ...form, seniority: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  {SENIORITY_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Headcount</label>
                <input
                  type="number"
                  min={1}
                  value={form.headcount}
                  onChange={(e) => setForm({ ...form, headcount: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Department</label>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Engineering"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Remote, NYC"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Job description and requirements..."
                rows={3}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Position"}
            </button>
          </form>
        </div>
      )}

      {/* Positions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : positions.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">No positions yet</h3>
          <p className="mt-2 text-sm text-gray-400">Create your first open position to start tracking hiring needs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {positions.map((p) => {
            const sc = statusConfig[p.status] || statusConfig.OPEN;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">{p.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {p.role} &middot; {p.seniority}
                      {p.department && ` &middot; ${p.department}`}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.bg} ${sc.text} ${sc.border}`}>
                    {sc.label}
                  </span>
                </div>

                {p.description && (
                  <p className="mb-3 text-sm text-gray-400 line-clamp-2">{p.description}</p>
                )}

                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  {p.location && (
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {p.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Headcount: {p.headcount}
                  </span>
                  <Link
                    href={`/dashboard/candidates?role=${encodeURIComponent(p.role)}`}
                    className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {p.candidateCount} candidate{p.candidateCount !== 1 ? "s" : ""} in pipeline
                  </Link>
                </div>

                <div className="flex items-center gap-2 border-t border-gray-800 pt-3">
                  <select
                    value={p.status}
                    onChange={(e) => handleStatusChange(p.id, e.target.value)}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-white focus:border-purple-500 focus:outline-none"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
