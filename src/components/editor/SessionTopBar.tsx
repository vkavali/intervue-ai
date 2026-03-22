"use client";

import { useMemo } from "react";
import VideoCall from "@/components/VideoCall";
import ScreenCapture from "@/components/ScreenCapture";
import EditorSettingsPanel from "@/components/editor/EditorSettingsPanel";
import type { EditorSettings } from "@/lib/editor-settings";

interface Question {
  id: string;
  title: string;
  aiLevel: number;
  timeLimit: number;
}

interface SessionTopBarProps {
  templateTitle: string;
  sessionId: string;
  userId: string;
  questions: Question[];
  currentQuestionIndex: number;
  onQuestionChange: (index: number) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  languages: { value: string; label: string }[];
  isNonCoding: boolean;
  isSql: boolean;
  elapsedTime: number;
  totalDurationSeconds: number;
  isLowTime: boolean;
  timeExpired: boolean;
  currentAiLevel: number;
  aiLevelLabels: Record<number, { label: string; color: string }>;
  showChat: boolean;
  onToggleChat: () => void;
  onResetCode: () => void;
  running: boolean;
  runningTests: boolean;
  onRunCode: () => void;
  onRunTests: () => void;
  testCaseCount: number;
  onSettingsChange: (settings: EditorSettings) => void;
  // Question progress: track which questions have code / passed tests
  questionProgress?: Map<number, "empty" | "started" | "passed">;
  // Socket connection status
  socketConnected?: boolean;
}

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export default function SessionTopBar({
  templateTitle,
  sessionId,
  userId,
  questions,
  currentQuestionIndex,
  onQuestionChange,
  language,
  onLanguageChange,
  languages,
  isNonCoding,
  isSql,
  elapsedTime,
  totalDurationSeconds,
  isLowTime,
  timeExpired,
  currentAiLevel,
  aiLevelLabels,
  showChat,
  onToggleChat,
  onResetCode,
  running,
  runningTests,
  onRunCode,
  onRunTests,
  testCaseCount,
  onSettingsChange,
  questionProgress,
  socketConnected,
}: SessionTopBarProps) {
  // Timer progress bar percentage
  const timerProgress = useMemo(() => {
    if (totalDurationSeconds <= 0) return 0;
    return Math.min(100, (elapsedTime / totalDurationSeconds) * 100);
  }, [elapsedTime, totalDurationSeconds]);

  // Timer bar color
  const timerBarColor = useMemo(() => {
    if (timerProgress < 60) return "bg-blue-500";
    if (timerProgress < 85) return "bg-yellow-500";
    return "bg-red-500";
  }, [timerProgress]);

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className="shrink-0">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-editor-border bg-editor-panel px-4 py-2">
        <div className="flex items-center gap-4">
          <span className="relative text-sm font-bold text-white font-mono my-1.5 mx-2 inline-block"><span className="absolute -top-2.5 left-0 text-[6px] font-normal text-gray-500 font-sans leading-none">the</span>printf<span className="text-saffron">(</span><span className="text-india-green">)</span><span className="absolute -bottom-2.5 right-0 text-[6px] font-normal text-gray-500 font-sans leading-none">.com</span></span>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-sm text-gray-300">{templateTitle}</span>
          {/* Socket status indicator */}
          {socketConnected !== undefined && (
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                socketConnected ? "bg-green-500" : "bg-gray-600"
              }`}
              title={socketConnected ? "Live connected" : "Using polling"}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          <VideoCall sessionId={sessionId} userId={userId} />
          <ScreenCapture sessionId={sessionId} isInterviewer={false} />

          {/* Question Navigation with Progress Dots */}
          <div className="flex items-center gap-1">
            {questions.map((_, idx) => {
              const progress = questionProgress?.get(idx) || "empty";
              return (
                <button
                  key={idx}
                  onClick={() => onQuestionChange(idx)}
                  className={`relative flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                    idx === currentQuestionIndex
                      ? "bg-white/10 text-white border border-saffron"
                      : "bg-editor-surface text-gray-400 hover:bg-editor-hover"
                  }`}
                >
                  {progress === "passed" ? (
                    <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : progress === "started" ? (
                    <span className="relative">
                      {idx + 1}
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    </span>
                  ) : (
                    idx + 1
                  )}
                </button>
              );
            })}
          </div>

          {/* Language Selector */}
          {!isNonCoding && (
            <select
              value={isSql ? "sql" : language}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={isSql}
              className="rounded border border-editor-border bg-editor-surface px-2 py-1 text-xs text-gray-300 focus:border-saffron focus:outline-none"
            >
              {isSql ? (
                <option value="sql">SQL</option>
              ) : (
                languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))
              )}
            </select>
          )}

          {/* Timer */}
          <div className={`flex items-center gap-2 rounded-lg px-3 py-1 ${
            isLowTime ? "bg-red-900/50 border border-red-500/30" : "bg-editor-surface"
          }`}>
            <svg className={`w-4 h-4 ${isLowTime ? "text-red-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className={`text-sm font-mono ${isLowTime ? "text-red-400" : "text-gray-300"}`}>
              {formatTime(elapsedTime)}
            </span>
            {totalDurationSeconds > 0 && (
              <span className="text-xs text-gray-500">/ {formatTime(totalDurationSeconds)}</span>
            )}
          </div>

          {/* AI Level Badge */}
          <span className={`rounded-full border border-editor-border px-3 py-1 text-xs font-medium ${
            aiLevelLabels[currentAiLevel]?.color || "text-gray-400"
          }`}>
            {aiLevelLabels[currentAiLevel]?.label || `L${currentAiLevel}`}
          </span>

          {/* Chat Toggle */}
          <button
            onClick={onToggleChat}
            className={`relative rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              showChat ? "bg-white/10 text-white border border-india-green" : "bg-editor-surface text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Editor Settings */}
          {!isNonCoding && (
            <EditorSettingsPanel onSettingsChange={onSettingsChange} />
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreen}
            className="rounded-lg bg-editor-surface px-2 py-1.5 text-gray-400 hover:text-white transition-colors"
            title="Toggle fullscreen"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Reset Code Button */}
          {!isNonCoding && (
            <button
              onClick={onResetCode}
              disabled={timeExpired}
              className="inline-flex items-center gap-1 rounded-lg border border-editor-border bg-editor-surface px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-editor-hover disabled:opacity-50 transition-colors"
              title="Reset to starter code"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          )}

          {/* Run Code Button */}
          {!isNonCoding && (
            <button
              onClick={onRunCode}
              disabled={running || runningTests || timeExpired}
              className="inline-flex items-center gap-1.5 rounded-lg bg-editor-hover px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-editor-muted disabled:opacity-50 transition-colors"
            >
              {running ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {running ? "Running..." : "Run Code"}
              <span className="text-gray-400 text-[10px]">Ctrl+Enter</span>
            </button>
          )}

          {/* Run Tests Button */}
          {!isNonCoding && testCaseCount > 0 && (
            <button
              onClick={onRunTests}
              disabled={running || runningTests || timeExpired}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
            >
              {runningTests ? (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {runningTests ? "Testing..." : "Run Tests"}
              <span className="text-green-300 text-[10px]">Ctrl+Shift+Enter</span>
            </button>
          )}
        </div>
      </div>

      {/* Timer Progress Bar */}
      {totalDurationSeconds > 0 && (
        <div className="h-[2px] bg-editor-surface">
          <div
            className={`h-full ${timerBarColor} transition-all duration-1000 ease-linear`}
            style={{ width: `${timerProgress}%` }}
          />
        </div>
      )}
    </div>
  );
}
