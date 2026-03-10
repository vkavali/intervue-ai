"use client";

import { useEffect, useState } from "react";

export default function EnrollmentPage() {
  const [enrollmentCode, setEnrollmentCode] = useState("");
  const [maxStudents, setMaxStudents] = useState(100);
  const [currentStudents, setCurrentStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/school/enrollment")
      .then((r) => (r.ok ? r.json() : { enrollmentCode: "", maxStudents: 100, currentStudents: 0 }))
      .then((data: { enrollmentCode: string; maxStudents: number; currentStudents: number }) => {
        setEnrollmentCode(data.enrollmentCode || "");
        setMaxStudents(data.maxStudents || 100);
        setCurrentStudents(data.currentStudents || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(enrollmentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/join/${enrollmentCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate enrollment code? The old code will stop working.")) return;
    setRegenerating(true);
    const res = await fetch("/api/school/enrollment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerate: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setEnrollmentCode(data.enrollmentCode);
    }
    setRegenerating(false);
  };

  const handleUpdateMax = async (newMax: number) => {
    const res = await fetch("/api/school/enrollment", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxStudents: newMax }),
    });
    if (res.ok) {
      setMaxStudents(newMax);
    }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Enrollment</h1>
        <p className="mt-1 text-gray-500">Manage your enrollment code and student capacity.</p>
      </div>

      {/* Enrollment Code */}
      <div className="rounded-xl border border-gray-200 bg-white p-8 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enrollment Code</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="font-mono text-4xl font-bold tracking-[0.3em] text-pink-500">
            {enrollmentCode}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="rounded-lg border border-pink-300 px-4 py-2 text-sm font-medium text-pink-500 hover:bg-pink-50 transition-colors"
          >
            Copy Enrollment Link
          </button>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {regenerating ? "Regenerating..." : "Regenerate Code"}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400">
          Students can join at: <code className="bg-gray-100 px-1 rounded">/join/{enrollmentCode}</code>
        </p>
      </div>

      {/* Capacity */}
      <div className="rounded-xl border border-gray-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Capacity</h2>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {currentStudents} <span className="text-lg text-gray-400">/ {maxStudents}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">students enrolled</p>
          </div>
          <div className="flex-1 max-w-xs">
            <label className="text-xs text-gray-500 block mb-1">Max students</label>
            <select
              value={maxStudents}
              onChange={(e) => handleUpdateMax(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            >
              {[25, 50, 100, 200, 500, 1000].map((n) => (
                <option key={n} value={n}>{n} students</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-pink-400 transition-all"
            style={{ width: `${Math.min((currentStudents / maxStudents) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
