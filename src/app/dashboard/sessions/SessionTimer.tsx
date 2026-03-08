"use client";

import { useState, useEffect } from "react";

interface SessionTimerProps {
  startedAt: string;
  totalDurationMinutes: number;
}

export function SessionTimer({ startedAt, totalDurationMinutes }: SessionTimerProps) {
  const [remaining, setRemaining] = useState(() => {
    const totalMs = totalDurationMinutes * 60 * 1000;
    const elapsed = Date.now() - new Date(startedAt).getTime();
    return Math.max(0, Math.floor((totalMs - elapsed) / 1000));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const totalMs = totalDurationMinutes * 60 * 1000;
      const elapsed = Date.now() - new Date(startedAt).getTime();
      const rem = Math.max(0, Math.floor((totalMs - elapsed) / 1000));
      setRemaining(rem);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, totalDurationMinutes]);

  if (remaining <= 0) {
    return <span className="text-xs font-medium text-red-400">Expired</span>;
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isLow = remaining < 300;

  return (
    <span className={`text-xs font-mono ${isLow ? "text-red-400" : "text-green-400"}`}>
      {mins}:{secs.toString().padStart(2, "0")} left
    </span>
  );
}
