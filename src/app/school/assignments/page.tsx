"use client";

import { useEffect, useState } from "react";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  problemIds: string[];
  dueDate: string | null;
  createdAt: string;
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problemIdsStr, setProblemIdsStr] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch("/api/school/assignments")
      .then((r) => (r.ok ? r.json() : { assignments: [] }))
      .then((data) => {
        setAssignments(data.assignments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const problemIds = problemIdsStr.split(",").map((s) => s.trim()).filter(Boolean);

    const res = await fetch("/api/school/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        problemIds,
        dueDate: dueDate || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setAssignments((prev) => [data.assignment, ...prev]);
      setTitle("");
      setDescription("");
      setProblemIdsStr("");
      setDueDate("");
      setShowForm(false);
    }
    setCreating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="mt-1 text-gray-500">Create and manage practice assignments for students.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg border border-pink-400 px-4 py-2 text-sm font-medium text-pink-500 hover:bg-pink-50 transition-colors"
        >
          {showForm ? "Cancel" : "New Assignment"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-xl border border-gray-200 bg-white p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="Week 1: Arrays & Strings"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="Complete these problems by the due date"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Problem IDs (comma-separated)</label>
            <input
              value={problemIdsStr}
              onChange={(e) => setProblemIdsStr(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
              placeholder="two-sum, reverse-string, valid-parentheses"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (optional)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 focus:border-pink-400 focus:outline-none focus:ring-1 focus:ring-pink-400"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-lg border border-pink-400 bg-pink-50 px-6 py-2.5 text-sm font-medium text-pink-600 hover:bg-pink-100 transition-colors disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Assignment"}
          </button>
        </form>
      )}

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No assignments yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                {a.dueDate && (
                  <span className="text-xs text-gray-400">
                    Due: {new Date(a.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
              {a.description && <p className="text-xs text-gray-500 mb-2">{a.description}</p>}
              <div className="flex gap-1.5">
                {a.problemIds.map((pid) => (
                  <span key={pid} className="rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-mono">
                    {pid}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
