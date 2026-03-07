"use client"

import { useState, useEffect, useCallback } from "react"

interface SessionTimerProps {
  startTime: string | Date
  timeLimit: number // in minutes
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

export default function SessionTimer({ startTime, timeLimit }: SessionTimerProps) {
  const computeTimes = useCallback(() => {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const elapsedMs = Math.max(0, now - start)
    const elapsedSec = Math.floor(elapsedMs / 1000)
    const totalSec = timeLimit * 60
    const remainingSec = Math.max(0, totalSec - elapsedSec)
    return { elapsedSec, remainingSec }
  }, [startTime, timeLimit])

  const [times, setTimes] = useState(computeTimes)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimes(computeTimes())
    }, 1000)

    return () => clearInterval(interval)
  }, [computeTimes])

  const { elapsedSec, remainingSec } = times
  const isLow = remainingSec > 0 && remainingSec <= 300 // 5 minutes
  const isUp = remainingSec === 0

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2">
      {/* Elapsed time */}
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Elapsed
        </p>
        <p className="font-mono text-lg font-bold text-white">
          {formatTime(elapsedSec)}
        </p>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-gray-700" />

      {/* Remaining time */}
      <div className="text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
          Remaining
        </p>
        <p
          className={`font-mono text-lg font-bold ${
            isUp
              ? "animate-pulse text-red-500"
              : isLow
                ? "text-red-400"
                : "text-green-400"
          }`}
        >
          {isUp ? "TIME UP" : formatTime(remainingSec)}
        </p>
      </div>

      {/* Warning indicator */}
      {(isLow || isUp) && (
        <div
          className={`ml-1 h-2.5 w-2.5 rounded-full ${
            isUp ? "animate-pulse bg-red-500" : "bg-red-400"
          }`}
        />
      )}
    </div>
  )
}
