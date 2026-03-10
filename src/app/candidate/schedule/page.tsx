"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  interviewer?: { name: string; email: string };
}

type GroupedSlots = Record<string, AvailabilitySlot[]>;

export default function CandidateSchedulePage() {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/interviewers/availability");
      if (!res.ok) {
        throw new Error("Failed to load available slots. Please try again.");
      }
      const data = await res.json();
      setSlots(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleBook = async (slot: AvailabilitySlot) => {
    setBookingId(slot.id);
    setError(null);
    try {
      const scheduledAt = `${slot.date}T${slot.startTime}`;
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledAt,
          availabilityId: slot.id,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.error || "Failed to book this slot. Please try again."
        );
      }
      setBookingSuccess(true);
      setTimeout(() => {
        router.push("/candidate");
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setBookingId(null);
    }
  };

  // Group slots by date
  const groupedSlots: GroupedSlots = slots.reduce<GroupedSlots>((acc, slot) => {
    const dateKey = slot.date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  return (
    <div>
      {/* Back link */}
      <Link
        href="/candidate"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Schedule an Interview</h1>
        <p className="mt-1 text-gray-400">
          Browse available time slots and book one that works for you.
        </p>
      </div>

      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 text-green-400">
              <svg
                className="w-5 h-5"
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
            <div>
              <h3 className="text-sm font-semibold text-green-400">
                Interview Booked Successfully
              </h3>
              <p className="text-xs text-green-300/70 mt-0.5">
                Redirecting you to the dashboard...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 text-red-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-400">Error</h3>
                <p className="text-xs text-red-300/70 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 animate-pulse"
            >
              <div className="h-5 w-40 bg-gray-800 rounded mb-4" />
              <div className="space-y-3">
                <div className="h-16 bg-gray-800/50 rounded-lg" />
                <div className="h-16 bg-gray-800/50 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && slots.length === 0 && !error && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-white">
            No available slots
          </h3>
          <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
            There are no interview slots available right now. Please check back
            later or contact your recruiter.
          </p>
          <button
            onClick={fetchSlots}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-5 py-2.5 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      )}

      {/* Slots grouped by date */}
      {!loading && sortedDates.length > 0 && (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/10 text-saffron">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-white">
                  {formatDate(dateKey)}
                </h2>
              </div>

              {/* Slots for this date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {groupedSlots[dateKey].map((slot) => (
                  <div
                    key={slot.id}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
                  >
                    {/* Time range */}
                    <div className="flex items-center gap-2 mb-3">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-white">
                        {formatTime(slot.startTime)} &ndash;{" "}
                        {formatTime(slot.endTime)}
                      </span>
                    </div>

                    {/* Interviewer info */}
                    {slot.interviewer && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-[10px] font-medium text-gray-300">
                          {slot.interviewer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-300">
                            {slot.interviewer.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {slot.interviewer.email}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Book button */}
                    <button
                      onClick={() => handleBook(slot)}
                      disabled={bookingId === slot.id || bookingSuccess}
                      className="w-full rounded-lg bg-gradient-to-r from-saffron to-india-green px-4 py-2 text-sm font-medium text-white transition-all hover:from-saffron-light hover:to-india-green-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bookingId === slot.id ? (
                        <span className="inline-flex items-center gap-2">
                          <svg
                            className="w-4 h-4 animate-spin"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Booking...
                        </span>
                      ) : (
                        "Book This Slot"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
