"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const STAGES = [
  "SCREENING",
  "TECHNICAL",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
  "FINAL",
  "HIRED",
  "REJECTED",
  "ON_HOLD",
];

const stageColors: Record<string, string> = {
  SCREENING: "text-blue-400",
  TECHNICAL: "text-purple-400",
  SYSTEM_DESIGN: "text-orange-400",
  BEHAVIORAL: "text-teal-400",
  FINAL: "text-indigo-400",
  HIRED: "text-green-400",
  REJECTED: "text-red-400",
  ON_HOLD: "text-yellow-400",
};

function formatStage(stage: string): string {
  return stage.replace(/_/g, " ");
}

export function StageDropdown({
  entryId,
  currentStage,
}: {
  entryId: string;
  currentStage: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleStageChange(newStage: string) {
    if (newStage === currentStage) {
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/pipeline/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update stage");
        return;
      }

      router.refresh();
    } catch {
      alert("Failed to update stage. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-700 disabled:opacity-50"
      >
        {loading ? (
          <svg
            className="h-3 w-3 animate-spin"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            Move Stage
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 bottom-full z-50 mb-1 w-44 max-h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 py-1 shadow-xl">
          {STAGES.map((stage) => (
            <button
              key={stage}
              onClick={() => handleStageChange(stage)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-gray-800 ${
                stage === currentStage
                  ? "bg-gray-800/50 font-semibold"
                  : "font-medium"
              } ${stageColors[stage] || "text-gray-300"}`}
            >
              {stage === currentStage && (
                <svg
                  className="h-3 w-3"
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
              )}
              {formatStage(stage)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
