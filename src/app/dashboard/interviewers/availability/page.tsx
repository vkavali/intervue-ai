"use client";

import { useState, useEffect, useCallback } from "react";

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  interviewer?: { name: string; email: string };
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Filter state
  const [filterDate, setFilterDate] = useState("");

  // Form state
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterDate) {
        params.set("startDate", filterDate);
        params.set("endDate", filterDate);
      }
      const queryString = params.toString();
      const url = `/api/interviewers/availability${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to fetch availability (${res.status})`);
      }
      const data: AvailabilitySlot[] = await res.json();
      setSlots(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const res = await fetch("/api/interviewers/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formDate,
          startTime: formStartTime,
          endTime: formEndTime,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Failed to create slot (${res.status})`);
      }

      setSubmitSuccess(true);
      setFormDate("");
      setFormStartTime("");
      setFormEndTime("");

      // Refetch the list after successful creation
      await fetchSlots();

      // Clear the success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Interviewer Availability</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage and view availability slots for scheduling interviews.
        </p>
      </div>

      {/* Add Availability Form */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Add Availability Slot</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="form-date" className="mb-1 block text-sm font-medium text-gray-300">
                Date
              </label>
              <input
                id="form-date"
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="form-start-time" className="mb-1 block text-sm font-medium text-gray-300">
                Start Time
              </label>
              <input
                id="form-start-time"
                type="time"
                required
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="form-end-time" className="mb-1 block text-sm font-medium text-gray-300">
                End Time
              </label>
              <input
                id="form-end-time"
                type="time"
                required
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {submitError}
            </div>
          )}

          {submitSuccess && (
            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              Availability slot added successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Adding...
              </>
            ) : (
              "Add Slot"
            )}
          </button>
        </form>
      </div>

      {/* Filter by Date */}
      <div className="mb-6 flex items-end gap-4">
        <div>
          <label htmlFor="filter-date" className="mb-1 block text-sm font-medium text-gray-300">
            Filter by Date
          </label>
          <input
            id="filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        {filterDate && (
          <button
            onClick={() => setFilterDate("")}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Availability Slots List */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 bg-gray-950/30 px-6 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Availability Slots
            {!loading && (
              <span className="ml-2 text-purple-400">({slots.length})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-8 w-8 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm text-gray-400">Loading availability slots...</p>
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">Failed to load availability</h3>
            <p className="mt-2 text-sm text-red-400">{error}</p>
            <button
              onClick={fetchSlots}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : slots.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-white">No availability slots</h3>
            <p className="mt-2 text-sm text-gray-400">
              {filterDate
                ? "No slots found for the selected date. Try a different date or clear the filter."
                : "Add your first availability slot using the form above."}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Interviewer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {slots.map((slot) => (
                <tr key={slot.id} className="transition-colors hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-sm font-medium text-white">
                    {formatDate(slot.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatTime(slot.startTime)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {formatTime(slot.endTime)}
                  </td>
                  <td className="px-6 py-4">
                    {slot.interviewer ? (
                      <div>
                        <p className="text-sm font-medium text-white">{slot.interviewer.name}</p>
                        <p className="text-xs text-gray-400">{slot.interviewer.email}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">--</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
