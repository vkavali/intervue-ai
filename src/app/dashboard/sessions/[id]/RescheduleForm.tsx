"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RescheduleFormProps {
  sessionId: string;
  currentScheduledAt: string | null;
}

export function RescheduleForm({ sessionId, currentScheduledAt }: RescheduleFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const dateTime = new Date(`${date}T${time}:00`);
      const res = await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          scheduledAt: dateTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to reschedule.");
      } else {
        setSuccess("Interview rescheduled successfully.");
        setOpen(false);
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 hover:bg-yellow-500/20 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {currentScheduledAt ? "Reschedule" : "Schedule"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
      <h4 className="text-sm font-medium text-yellow-400 mb-3">
        {currentScheduledAt ? "Reschedule" : "Schedule"} Interview
      </h4>
      {currentScheduledAt && (
        <p className="text-xs text-gray-500 mb-3">
          Currently scheduled: {new Date(currentScheduledAt).toLocaleString()}
        </p>
      )}
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:border-yellow-500 focus:outline-none"
          >
            {Array.from({ length: 24 }, (_, h) =>
              [0, 30].map((m) => {
                const val = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                return <option key={val} value={val}>{val}</option>;
              })
            )}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !date}
          className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saving..." : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(""); setSuccess(""); }}
          className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-2 text-sm text-green-400">{success}</p>}
    </form>
  );
}
