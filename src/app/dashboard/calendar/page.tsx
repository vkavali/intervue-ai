"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CalendarSession {
  id: string;
  scheduledAt: string;
  status: string;
  candidate: { id: string; name: string; email: string };
  interviewer: { id: string; name: string; email: string } | null;
  template: { id: string; title: string; role: string; seniority: string };
}

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  interviewer: { id: string; name: string; email: string };
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
        setAvailability(data.availability);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const goToday = () => {
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  const goPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  // Group sessions & availability by day
  const sessionsByDay: Record<number, CalendarSession[]> = {};
  const availByDay: Record<number, AvailabilitySlot[]> = {};

  for (const s of sessions) {
    const d = new Date(s.scheduledAt);
    const day = d.getDate();
    if (!sessionsByDay[day]) sessionsByDay[day] = [];
    sessionsByDay[day].push(s);
  }

  for (const a of availability) {
    const d = new Date(a.date);
    const day = d.getDate();
    if (!availByDay[day]) availByDay[day] = [];
    availByDay[day].push(a);
  }

  // Stats
  const todayDate = today.getDate();
  const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear();
  const totalScheduled = sessions.length;
  const activeToday = isCurrentMonth ? (sessionsByDay[todayDate]?.length || 0) : 0;

  // Upcoming this week (from today through end of week)
  const currentDayOfWeek = today.getDay();
  const daysLeftInWeek = 6 - currentDayOfWeek;
  let upcomingThisWeek = 0;
  if (isCurrentMonth) {
    for (let i = todayDate; i <= Math.min(todayDate + daysLeftInWeek, daysInMonth); i++) {
      upcomingThisWeek += sessionsByDay[i]?.length || 0;
    }
  }

  const statusColor: Record<string, string> = {
    PENDING: "bg-yellow-500",
    ACTIVE: "bg-green-500",
    COMPLETED: "bg-blue-500",
    CANCELLED: "bg-gray-500",
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="mt-1 text-sm text-gray-400">View scheduled interviews and interviewer availability</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Scheduled This Month</p>
          <p className="mt-1 text-2xl font-bold text-white">{totalScheduled}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Today</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{activeToday}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Upcoming This Week</p>
          <p className="mt-1 text-2xl font-bold text-purple-400">{upcomingThisWeek}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="min-w-[200px] text-center text-lg font-semibold text-white">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button
            onClick={goNext}
            className="rounded-lg border border-gray-700 bg-gray-800 p-2 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToday}
          className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-400 hover:bg-purple-500/20"
        >
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-800 bg-gray-950/50">
          {DAY_NAMES.map((d) => (
            <div key={d} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
              {d}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <svg className="h-8 w-8 animate-spin text-purple-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum = i - firstDay + 1;
              const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
              const isToday = isCurrentMonth && dayNum === todayDate;
              const daySessions = isValidDay ? sessionsByDay[dayNum] || [] : [];
              const dayAvail = isValidDay ? availByDay[dayNum] || [] : [];

              return (
                <div
                  key={i}
                  className={`min-h-[110px] border-b border-r border-gray-800/50 p-1.5 ${
                    isValidDay ? "" : "bg-gray-950/30"
                  }`}
                >
                  {isValidDay && (
                    <>
                      <div
                        className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                          isToday
                            ? "bg-purple-600 text-white"
                            : "text-gray-300"
                        }`}
                      >
                        {dayNum}
                      </div>

                      {/* Availability indicators */}
                      {dayAvail.length > 0 && (
                        <div className="mb-1 flex items-center gap-1">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] text-green-400">
                            {dayAvail.length} slot{dayAvail.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                      {/* Session chips */}
                      <div className="space-y-1">
                        {daySessions.slice(0, 3).map((s) => (
                          <Link
                            key={s.id}
                            href={`/dashboard/sessions/${s.id}`}
                            className="group flex items-center gap-1 rounded px-1 py-0.5 hover:bg-gray-800"
                          >
                            <div className={`h-2 w-2 flex-shrink-0 rounded-full ${statusColor[s.status] || "bg-gray-500"}`} />
                            <span className="truncate text-[11px] text-gray-300 group-hover:text-white">
                              {s.candidate.name.split(" ")[0]} - {s.template.title.length > 15 ? s.template.title.slice(0, 15) + "..." : s.template.title}
                            </span>
                          </Link>
                        ))}
                        {daySessions.length > 3 && (
                          <span className="block px-1 text-[10px] text-gray-500">
                            +{daySessions.length - 3} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Pending
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" /> Active
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-500" /> Cancelled
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
          <span className="text-green-400">Available</span>
        </div>
      </div>

      {/* Today&apos;s Sessions Detail */}
      {isCurrentMonth && (sessionsByDay[todayDate]?.length || 0) > 0 && (
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Today&apos;s Interviews</h3>
          <div className="space-y-3">
            {sessionsByDay[todayDate]!.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                className="flex items-center justify-between rounded-lg border border-gray-800 p-4 transition-colors hover:border-gray-700 hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${statusColor[s.status] || "bg-gray-500"}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{s.candidate.name}</p>
                    <p className="text-xs text-gray-400">{s.template.title} &middot; {s.template.role} ({s.template.seniority})</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{formatTime(s.scheduledAt)}</p>
                  {s.interviewer && (
                    <p className="text-xs text-gray-500">w/ {s.interviewer.name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
