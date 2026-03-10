"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Interviewer {
  id: string;
  name: string;
  email: string;
}

interface ReassignInterviewerFormProps {
  sessionId: string;
  currentInterviewerId: string | null;
  interviewers: Interviewer[];
}

export function ReassignInterviewerForm({
  sessionId,
  currentInterviewerId,
  interviewers,
}: ReassignInterviewerFormProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(currentInterviewerId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewerId: selectedId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reassign interviewer.");
      } else {
        setSuccess("Interviewer reassigned successfully.");
        router.refresh();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Assign Interviewer
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:border-saffron focus:outline-none"
        >
          <option value="">Select an interviewer</option>
          {interviewers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name} ({i.email})
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !selectedId || selectedId === currentInterviewerId}
        className="rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving..." : "Reassign"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-green-400">{success}</p>}
    </form>
  );
}
