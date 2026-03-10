"use client"

import { useState } from "react"

const AI_LEVELS = [
  {
    level: 0,
    label: "L0 - Off",
    description: "No AI help. Candidate works independently.",
    color: "bg-red-500",
    textColor: "text-red-400",
  },
  {
    level: 1,
    label: "L1 - Clarify",
    description: "AI can only clarify the question, not give hints.",
    color: "bg-yellow-500",
    textColor: "text-yellow-400",
  },
  {
    level: 2,
    label: "L2 - Guided",
    description: "AI provides hints and nudges toward the solution.",
    color: "bg-blue-500",
    textColor: "text-blue-400",
  },
  {
    level: 3,
    label: "L3 - Assisted",
    description: "AI provides partial solutions and explanations.",
    color: "bg-saffron",
    textColor: "text-saffron",
  },
  {
    level: 4,
    label: "L4 - Full",
    description: "AI can generate full code solutions.",
    color: "bg-green-500",
    textColor: "text-green-400",
  },
] as const

interface AIAssistControlProps {
  sessionId: string
  currentLevel: number
  onLevelChange: (level: number) => void
}

export default function AIAssistControl({
  sessionId,
  currentLevel,
  onLevelChange,
}: AIAssistControlProps) {
  const [pendingLevel, setPendingLevel] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentConfig = AI_LEVELS[currentLevel] ?? AI_LEVELS[0]

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLevel = parseInt(e.target.value, 10)
    if (newLevel !== currentLevel) {
      setPendingLevel(newLevel)
      setReason("")
    }
  }

  const confirmChange = async () => {
    if (pendingLevel === null) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/sessions/${sessionId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: pendingLevel,
          reason: reason.trim() || "No reason provided",
        }),
      })

      if (!res.ok) {
        throw new Error(`Failed to update AI level: ${res.status}`)
      }

      onLevelChange(pendingLevel)
      setPendingLevel(null)
      setReason("")
    } catch (err) {
      console.error("Failed to change AI level:", err)
      alert(err instanceof Error ? err.message : "Failed to update AI level")
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelChange = () => {
    setPendingLevel(null)
    setReason("")
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      {/* Current level display */}
      <div className="mb-4 text-center">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
          AI Assistance Level
        </h3>
        <div className="flex items-center justify-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold text-white ${currentConfig.color}`}
          >
            {currentConfig.label}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">{currentConfig.description}</p>
      </div>

      {/* Slider */}
      <div className="mb-3">
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={pendingLevel ?? currentLevel}
          onChange={handleSliderChange}
          disabled={isSubmitting}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-600 accent-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Level markers */}
        <div className="mt-1 flex justify-between px-0.5">
          {AI_LEVELS.map((level) => (
            <span
              key={level.level}
              className={`text-[10px] font-medium ${
                level.level === (pendingLevel ?? currentLevel)
                  ? level.textColor
                  : "text-gray-600"
              }`}
            >
              L{level.level}
            </span>
          ))}
        </div>
      </div>

      {/* Pending change confirmation */}
      {pendingLevel !== null && (
        <div className="mt-3 rounded-md border border-gray-600 bg-gray-900 p-3">
          <p className="mb-2 text-xs text-gray-300">
            Change to{" "}
            <span className={`font-bold ${AI_LEVELS[pendingLevel].textColor}`}>
              {AI_LEVELS[pendingLevel].label}
            </span>
            ?
          </p>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for change (optional)..."
            rows={2}
            className="mb-2 w-full resize-none rounded border border-gray-600 bg-gray-800 px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <button
              onClick={confirmChange}
              disabled={isSubmitting}
              className="flex-1 rounded border border-india-green bg-transparent px-3 py-1.5 text-xs font-medium text-india-green-light transition-colors hover:bg-india-green/10 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Confirm"}
            </button>
            <button
              onClick={cancelChange}
              disabled={isSubmitting}
              className="rounded border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
