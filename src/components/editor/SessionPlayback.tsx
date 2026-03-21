"use client";

import { useState, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";

interface CodeSnapshot {
  id: string;
  code: string;
  language: string;
  questionIndex: number;
  timestamp: string;
}

interface SessionPlaybackProps {
  sessionId: string;
  onClose: () => void;
}

export default function SessionPlayback({ sessionId, onClose }: SessionPlaybackProps) {
  const [snapshots, setSnapshots] = useState<CodeSnapshot[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Fetch snapshots
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/snapshots`);
        if (res.ok) {
          const data = await res.json();
          setSnapshots(data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  // Auto-play
  useEffect(() => {
    if (!playing || snapshots.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= snapshots.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [playing, snapshots.length]);

  const togglePlay = useCallback(() => {
    if (currentIndex >= snapshots.length - 1) {
      setCurrentIndex(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [currentIndex, snapshots.length]);

  const current = snapshots[currentIndex];
  const progress = snapshots.length > 1 ? (currentIndex / (snapshots.length - 1)) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-950">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading playback...
        </div>
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-950 gap-4">
        <p className="text-gray-500 text-sm">No code snapshots recorded for this session.</p>
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-700 px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Playback Header */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">Session Playback</span>
          <span className="text-xs text-gray-500">
            {snapshots.length} snapshots
          </span>
        </div>
        <div className="flex items-center gap-2">
          {current && (
            <span className="text-xs text-gray-400">
              Q{current.questionIndex + 1} &middot; {current.language} &middot;{" "}
              {new Date(current.timestamp).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-700 px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={current?.language || "javascript"}
          value={current?.code || "// No code at this point"}
          theme="vs-dark"
          options={{
            readOnly: true,
            fontSize: 14,
            fontFamily: "var(--font-geist-mono), monospace",
            minimap: { enabled: false },
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </div>

      {/* Playback Controls */}
      <div className="border-t border-gray-800 bg-gray-900 px-4 py-3 shrink-0">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="rounded-lg bg-saffron/20 border border-saffron/30 px-3 py-1.5 text-xs font-medium text-saffron hover:bg-saffron/30 transition-colors"
          >
            {playing ? "Pause" : currentIndex >= snapshots.length - 1 ? "Replay" : "Play"}
          </button>

          {/* Timeline Scrubber */}
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={snapshots.length - 1}
              value={currentIndex}
              onChange={(e) => {
                setCurrentIndex(parseInt(e.target.value));
                setPlaying(false);
              }}
              className="w-full accent-saffron"
            />
            {/* Progress bar overlay */}
            <div className="h-0.5 bg-gray-800 rounded-full -mt-1 relative pointer-events-none">
              <div
                className="h-full bg-saffron rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Counter */}
          <span className="text-xs text-gray-400 font-mono shrink-0">
            {currentIndex + 1} / {snapshots.length}
          </span>
        </div>
      </div>
    </div>
  );
}
