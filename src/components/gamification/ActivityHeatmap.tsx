"use client";

import { useMemo } from "react";

interface HeatmapEntry {
  date: string;
  problems: number;
  xpEarned: number;
}

interface ActivityHeatmapProps {
  data: HeatmapEntry[];
}

function getColor(problems: number): string {
  if (problems === 0) return "bg-gray-100";
  if (problems <= 2) return "bg-green-200";
  if (problems <= 5) return "bg-green-400";
  return "bg-green-600";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { weeks, monthLabels, totalProblems, totalDays } = useMemo(() => {
    const dataMap = new Map(data.map((d) => [d.date, d]));

    // Generate last 365 days
    const today = new Date();
    const days: Array<{ date: string; problems: number; xpEarned: number; dayOfWeek: number }> = [];

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = dataMap.get(dateStr);
      days.push({
        date: dateStr,
        problems: entry?.problems || 0,
        xpEarned: entry?.xpEarned || 0,
        dayOfWeek: d.getDay(),
      });
    }

    // Group into weeks (columns)
    const weeks: typeof days[] = [];
    let currentWeek: typeof days = [];

    // Pad first week with empty cells
    const firstDay = days[0];
    for (let i = 0; i < firstDay.dayOfWeek; i++) {
      currentWeek.push({ date: "", problems: -1, xpEarned: 0, dayOfWeek: i });
    }

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Generate month labels
    const monthLabels: Array<{ label: string; col: number }> = [];
    let lastMonth = -1;
    for (let i = 0; i < weeks.length; i++) {
      const validDay = weeks[i].find((d) => d.date);
      if (validDay) {
        const month = new Date(validDay.date).getMonth();
        if (month !== lastMonth) {
          monthLabels.push({ label: MONTHS[month], col: i });
          lastMonth = month;
        }
      }
    }

    const totalProblems = data.reduce((s, d) => s + d.problems, 0);
    const totalDays = data.filter((d) => d.problems > 0).length;

    return { weeks, monthLabels, totalProblems, totalDays };
  }, [data]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{totalProblems} problems</span>
          <span>{totalDays} active days</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-0.5">
          {/* Month labels */}
          <div className="flex ml-8">
            {monthLabels.map((m, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400"
                style={{
                  position: "relative",
                  left: `${m.col * 13}px`,
                  marginRight: i < monthLabels.length - 1
                    ? `${(monthLabels[i + 1].col - m.col) * 13 - 30}px`
                    : 0,
                }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAYS.map((day, i) => (
                <div key={i} className="h-[11px] flex items-center">
                  <span className="text-[9px] text-gray-400 w-6 text-right">{day}</span>
                </div>
              ))}
            </div>

            {/* Weeks */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className={`h-[11px] w-[11px] rounded-sm ${
                      day.problems === -1 ? "bg-transparent" : getColor(day.problems)
                    }`}
                    title={
                      day.date
                        ? `${day.date}: ${day.problems} problem${day.problems !== 1 ? "s" : ""}, ${day.xpEarned} XP`
                        : ""
                    }
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[9px] text-gray-400">Less</span>
            <div className="h-[11px] w-[11px] rounded-sm bg-gray-100" />
            <div className="h-[11px] w-[11px] rounded-sm bg-green-200" />
            <div className="h-[11px] w-[11px] rounded-sm bg-green-400" />
            <div className="h-[11px] w-[11px] rounded-sm bg-green-600" />
            <span className="text-[9px] text-gray-400">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
