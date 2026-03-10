"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface CalendarSession {
  id: string;
  scheduledAt: string | null;
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

function formatTime(dateStr: string | null | undefined) {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "TBD";
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const TIME_OPTIONS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
];

function formatTimeLabel(t: string) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export default function CalendarPage() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Day detail panel
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Add availability form
  const [showAddAvail, setShowAddAvail] = useState(false);
  const [availStartTime, setAvailStartTime] = useState("09:00");
  const [availEndTime, setAvailEndTime] = useState("17:00");
  const [savingAvail, setSavingAvail] = useState(false);

  // Reschedule modal
  const [rescheduleSession, setRescheduleSession] = useState<CalendarSession | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [savingReschedule, setSavingReschedule] = useState(false);

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

  // Reset selected day when month changes
  useEffect(() => {
    setSelectedDay(null);
    setShowAddAvail(false);
  }, [month, year]);

  const goToday = () => {
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // ─── CRUD handlers ───

  const handleAddAvailability = async () => {
    if (!selectedDay) return;
    setSavingAvail(true);
    try {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addAvailability",
          date: dateStr,
          startTime: availStartTime,
          endTime: availEndTime,
        }),
      });
      if (res.ok) {
        await fetchData();
        setShowAddAvail(false);
        setAvailStartTime("09:00");
        setAvailEndTime("17:00");
      }
    } catch { /* */ }
    finally { setSavingAvail(false); }
  };

  const handleDeleteAvailability = async (slotId: string) => {
    try {
      const res = await fetch("/api/calendar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availabilityId: slotId }),
      });
      if (res.ok) await fetchData();
    } catch { /* */ }
  };

  const handleReschedule = async () => {
    if (!rescheduleSession || !rescheduleDate) return;
    setSavingReschedule(true);
    try {
      const dateTime = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
      const res = await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: rescheduleSession.id,
          scheduledAt: dateTime.toISOString(),
        }),
      });
      if (res.ok) {
        await fetchData();
        setRescheduleSession(null);
      }
    } catch { /* */ }
    finally { setSavingReschedule(false); }
  };

  const handleCancelSession = async (sessionId: string) => {
    if (!confirm("Cancel this interview session?")) return;
    try {
      const res = await fetch("/api/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, status: "CANCELLED" }),
      });
      if (res.ok) await fetchData();
    } catch { /* */ }
  };

  // ─── Build calendar grid ───

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const sessionsByDay: Record<number, CalendarSession[]> = {};
  const availByDay: Record<number, AvailabilitySlot[]> = {};

  for (const s of sessions) {
    if (!s.scheduledAt) continue;
    const d = new Date(s.scheduledAt);
    if (isNaN(d.getTime())) continue;
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

  const unscheduledSessions = sessions.filter(s => !s.scheduledAt);

  const todayDate = today.getDate();
  const isCurrentMonth = month === today.getMonth() + 1 && year === today.getFullYear();
  const totalScheduled = sessions.length;
  const activeToday = isCurrentMonth ? (sessionsByDay[todayDate]?.length || 0) : 0;

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

  const selectedDaySessions = selectedDay ? sessionsByDay[selectedDay] || [] : [];
  const selectedDayAvail = selectedDay ? availByDay[selectedDay] || [] : [];
  const selectedDateStr = selectedDay
    ? `${MONTH_NAMES[month - 1]} ${selectedDay}, ${year}`
    : "";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Manage interviews and interviewer availability</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Scheduled This Month</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalScheduled}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Active Today</p>
          <p className="mt-1 text-2xl font-bold text-green-400">{activeToday}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Upcoming This Week</p>
          <p className="mt-1 text-2xl font-bold text-saffron">{upcomingThisWeek}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="rounded-lg border border-gray-200 bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="min-w-[200px] text-center text-lg font-semibold text-gray-900">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          <button onClick={goNext} className="rounded-lg border border-gray-200 bg-gray-100 p-2 text-gray-700 hover:bg-gray-200 hover:text-gray-900">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        <button onClick={goToday} className="rounded-lg border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-sm font-medium text-saffron hover:bg-saffron/20">
          Today
        </button>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
              {DAY_NAMES.map((d) => (
                <div key={d} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">{d}</div>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <svg className="h-8 w-8 animate-spin text-saffron" viewBox="0 0 24 24" fill="none">
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
                  const isSelected = selectedDay === dayNum;
                  const daySessions = isValidDay ? sessionsByDay[dayNum] || [] : [];
                  const dayAvail = isValidDay ? availByDay[dayNum] || [] : [];
                  const hasContent = daySessions.length > 0 || dayAvail.length > 0;

                  return (
                    <div
                      key={i}
                      onClick={() => isValidDay && setSelectedDay(dayNum === selectedDay ? null : dayNum)}
                      className={`min-h-[110px] border-b border-r border-gray-200/50 p-1.5 transition-colors ${
                        isValidDay ? "cursor-pointer hover:bg-gray-50" : "bg-gray-50/30"
                      } ${isSelected ? "bg-saffron/10 ring-1 ring-inset ring-saffron/40" : ""}`}
                    >
                      {isValidDay && (
                        <>
                          <div className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                            isToday ? "bg-white/10 text-gray-900 border border-saffron" : isSelected ? "text-saffron-dark" : "text-gray-700"
                          }`}>
                            {dayNum}
                          </div>

                          {dayAvail.length > 0 && (
                            <div className="mb-1 flex items-center gap-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span className="text-[10px] text-green-400">{dayAvail.length} slot{dayAvail.length > 1 ? "s" : ""}</span>
                            </div>
                          )}

                          <div className="space-y-1">
                            {daySessions.slice(0, 2).map((s) => (
                              <div key={s.id} className="flex items-center gap-1 rounded px-1 py-0.5">
                                <div className={`h-2 w-2 flex-shrink-0 rounded-full ${statusColor[s.status] || "bg-gray-500"}`} />
                                <span className="truncate text-[11px] text-gray-700">
                                  {s.candidate.name.split(" ")[0]}
                                </span>
                              </div>
                            ))}
                            {daySessions.length > 2 && (
                              <span className="block px-1 text-[10px] text-gray-500">+{daySessions.length - 2} more</span>
                            )}
                          </div>

                          {!hasContent && (
                            <div className="mt-2 flex justify-center opacity-0 group-hover:opacity-100">
                              <span className="text-[10px] text-gray-600">Click to add</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Pending</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-green-500" /> Active</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Completed</div>
            <div className="flex items-center gap-1.5"><div className="h-2.5 w-2.5 rounded-full bg-gray-500" /> Cancelled</div>
            <div className="flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-green-500" /><span className="text-green-400">Available</span></div>
          </div>
        </div>

        {/* ─── Day Detail Panel ─── */}
        {selectedDay && (
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-4">
              {/* Date header */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedDateStr}</h3>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-500 hover:text-gray-900">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Interviews on this day */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Interviews ({selectedDaySessions.length})</h4>
                {selectedDaySessions.length === 0 ? (
                  <p className="text-xs text-gray-500">No interviews scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDaySessions.map((s) => (
                      <div key={s.id} className="rounded-lg border border-gray-200 p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${statusColor[s.status] || "bg-gray-500"}`} />
                              <span className="text-sm font-medium text-gray-900">{s.candidate.name}</span>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">{s.template.title}</p>
                            <p className="text-xs text-gray-500">{formatTime(s.scheduledAt)}{s.interviewer ? ` · w/ ${s.interviewer.name}` : ""}</p>
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Link href={`/dashboard/sessions/${s.id}`} className="rounded bg-saffron/10 px-2 py-1 text-xs text-saffron hover:bg-saffron/20">
                            View
                          </Link>
                          {s.status === "PENDING" && (
                            <>
                              <button onClick={() => { setRescheduleSession(s); setRescheduleDate(`${year}-${String(month).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`); }} className="rounded bg-india-green/10 px-2 py-1 text-xs text-india-green hover:bg-india-green/20">
                                Reschedule
                              </button>
                              <button onClick={() => handleCancelSession(s.id)} className="rounded bg-accent-red/10 px-2 py-1 text-xs text-accent-red hover:bg-accent-red/50/20">
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Availability on this day */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-700">Availability ({selectedDayAvail.length})</h4>
                  <button
                    onClick={() => setShowAddAvail(!showAddAvail)}
                    className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-400 hover:bg-india-green/10/20"
                  >
                    {showAddAvail ? "Cancel" : "+ Add Slot"}
                  </button>
                </div>

                {/* Add availability form */}
                {showAddAvail && (
                  <div className="mb-3 rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500">Start Time</label>
                        <select value={availStartTime} onChange={(e) => setAvailStartTime(e.target.value)} className="mt-1 w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-sm text-gray-900">
                          {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">End Time</label>
                        <select value={availEndTime} onChange={(e) => setAvailEndTime(e.target.value)} className="mt-1 w-full rounded border border-gray-200 bg-gray-100 px-2 py-1.5 text-sm text-gray-900">
                          {TIME_OPTIONS.filter((t) => t > availStartTime).map((t) => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={handleAddAvailability}
                        disabled={savingAvail}
                        className="w-full rounded border border-india-green bg-transparent px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-green-700 disabled:opacity-50"
                      >
                        {savingAvail ? "Saving..." : "Add Availability"}
                      </button>
                    </div>
                  </div>
                )}

                {selectedDayAvail.length === 0 && !showAddAvail ? (
                  <p className="text-xs text-gray-500">No availability set</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayAvail.map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-2">
                        <div>
                          <p className="text-sm text-gray-900">{formatTimeLabel(a.startTime)} - {formatTimeLabel(a.endTime)}</p>
                          <p className="text-xs text-gray-500">{a.interviewer.name}</p>
                        </div>
                        <button onClick={() => handleDeleteAvailability(a.id)} className="rounded p-1 text-gray-500 hover:bg-accent-red/10 hover:text-accent-red">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick actions */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/dashboard/sessions" className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Create New Session
                  </Link>
                  <Link href="/dashboard/interviews" className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    Manage Templates
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unscheduled Sessions */}
      {unscheduledSessions.length > 0 && (
        <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6">
          <h3 className="mb-4 text-lg font-semibold text-yellow-400">Unscheduled Interviews ({unscheduledSessions.length})</h3>
          <div className="space-y-3">
            {unscheduledSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-3 w-3 rounded-full ${statusColor[s.status] || "bg-gray-500"}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.candidate.name}</p>
                    <p className="text-xs text-gray-500">{s.template.title} &middot; {s.template.role} ({s.template.seniority})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setRescheduleSession(s); setRescheduleDate(""); }}
                    className="rounded bg-saffron/10 px-3 py-1.5 text-xs font-medium text-saffron hover:bg-saffron/20"
                  >
                    Schedule
                  </button>
                  <Link href={`/dashboard/sessions/${s.id}`} className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-600">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setRescheduleSession(null)}>
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-1 text-lg font-semibold text-gray-900">
              {rescheduleSession.scheduledAt ? "Reschedule" : "Schedule"} Interview
            </h3>
            <p className="mb-4 text-sm text-gray-500">
              {rescheduleSession.candidate.name} &middot; {rescheduleSession.template.title}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900"
                />
              </div>
              <div>
                <label className="text-sm text-gray-500">Time</label>
                <select value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} className="mt-1 w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{formatTimeLabel(t)}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setRescheduleSession(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!rescheduleDate || savingReschedule}
                className="rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 disabled:opacity-50"
              >
                {savingReschedule ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
