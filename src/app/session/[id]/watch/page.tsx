"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";

interface SessionData {
  id: string;
  status: string;
  currentQuestionIndex: number;
  code: string | null;
  language: string | null;
  aiLevel: number;
  template: {
    title: string;
    role: string;
    seniority: string;
    defaultAiLevel: number;
    questions: {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      aiLevel: number;
      timeLimit: number;
      orderIndex: number;
    }[];
  };
  candidate: {
    name: string;
    email: string;
  };
  aiInteractions: {
    id: string;
    prompt: string;
    response: string;
    aiLevel: number;
    timestamp: string;
  }[];
  interviewerNotes: {
    id: string;
    content: string;
    timestamp: string;
    interviewer: { name: string };
  }[];
}

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-red-400" },
  1: { label: "L1 Hint", color: "text-yellow-400" },
  2: { label: "L2 Scaffold", color: "text-blue-400" },
  3: { label: "L3 Guide", color: "text-purple-400" },
  4: { label: "L4 Copilot", color: "text-green-400" },
};

export default function WatchSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiSliderValue, setAiSliderValue] = useState(0);
  const [aiSliderReason, setAiSliderReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingLevel, setPendingLevel] = useState(0);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingAiLevel, setUpdatingAiLevel] = useState(false);
  const interactionLogRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (!res.ok) {
        if (loading) {
          setError("Failed to load session");
          setLoading(false);
        }
        return;
      }
      const data = await res.json();
      setSessionData(data);
      if (loading) {
        setAiSliderValue(data.aiLevel);
        setLoading(false);
      }
    } catch {
      if (loading) {
        setError("Failed to load session");
        setLoading(false);
      }
    }
  }, [sessionId, loading]);

  // Initial fetch
  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // Poll every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // Auto-scroll interaction log
  useEffect(() => {
    if (interactionLogRef.current) {
      interactionLogRef.current.scrollTop =
        interactionLogRef.current.scrollHeight;
    }
  }, [sessionData?.aiInteractions]);

  // Handle AI level change
  function handleSliderChange(newLevel: number) {
    if (newLevel !== aiSliderValue) {
      setPendingLevel(newLevel);
      setShowReasonInput(true);
    }
  }

  async function submitAiLevelChange() {
    if (!aiSliderReason.trim()) return;
    setUpdatingAiLevel(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newLevel: pendingLevel,
          reason: aiSliderReason,
        }),
      });

      if (res.ok) {
        setAiSliderValue(pendingLevel);
        setShowReasonInput(false);
        setAiSliderReason("");
        // Refetch to get updated data
        fetchSession();
      }
    } catch {
      // Silent fail
    } finally {
      setUpdatingAiLevel(false);
    }
  }

  // Handle note submission
  async function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setSubmittingNote(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });

      if (res.ok) {
        setNoteContent("");
        fetchSession();
      }
    } catch {
      // Silent fail
    } finally {
      setSubmittingNote(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <p className="text-red-400 text-lg">{error || "Session not found"}</p>
      </div>
    );
  }

  const currentQuestion =
    sessionData.template.questions[sessionData.currentQuestionIndex];

  return (
    <div className="flex h-screen flex-col bg-gray-950 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-white">
            Intervue<span className="text-blue-400">.AI</span>
          </span>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-sm text-gray-300">
            Watching: {sessionData.candidate.name}
          </span>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-sm text-gray-400">
            {sessionData.template.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`relative flex h-2.5 w-2.5 ${
                sessionData.status === "ACTIVE" ? "" : "opacity-50"
              }`}
            >
              {sessionData.status === "ACTIVE" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  sessionData.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"
                }`}
              />
            </span>
            <span
              className={`text-xs font-medium ${
                sessionData.status === "ACTIVE" ? "text-green-400" : "text-gray-400"
              }`}
            >
              {sessionData.status}
            </span>
          </div>

          {currentQuestion && (
            <span className="text-xs text-gray-500">
              Q{sessionData.currentQuestionIndex + 1}/{sessionData.template.questions.length}:{" "}
              {currentQuestion.title}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Code Editor (read-only) */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">
          <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">
                Candidate&apos;s Code
              </span>
              <span className="text-xs text-gray-600">(read-only)</span>
            </div>
            <span className="text-xs text-gray-500">
              {sessionData.language || "javascript"}
            </span>
          </div>
          <Editor
            height="100%"
            language={sessionData.language || "javascript"}
            value={sessionData.code || "// Waiting for candidate to start coding..."}
            theme="vs-dark"
            options={{
              readOnly: true,
              fontSize: 14,
              fontFamily: "var(--font-geist-mono), monospace",
              minimap: { enabled: false },
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              renderLineHighlight: "none",
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>

        {/* Right: AI Log + Notes */}
        <div className="w-96 shrink-0 flex flex-col overflow-hidden">
          {/* AI Interaction Log */}
          <div className="flex-1 flex flex-col border-b border-gray-800 overflow-hidden">
            <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                AI Interaction Log ({sessionData.aiInteractions.length})
              </h3>
            </div>
            <div
              ref={interactionLogRef}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {sessionData.aiInteractions.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-8">
                  No AI interactions yet.
                </p>
              ) : (
                sessionData.aiInteractions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="rounded-lg border border-gray-800 bg-gray-900 p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-[10px] font-medium ${
                          aiLevelLabels[interaction.aiLevel]?.color || "text-gray-400"
                        }`}
                      >
                        {aiLevelLabels[interaction.aiLevel]?.label}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(interaction.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] text-gray-500 block">
                          Candidate:
                        </span>
                        <p className="text-xs text-blue-300">
                          {interaction.prompt}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">
                          AI:
                        </span>
                        <p className="text-xs text-gray-300 whitespace-pre-wrap">
                          {interaction.response.length > 300
                            ? interaction.response.substring(0, 300) + "..."
                            : interaction.response}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Panel */}
          <div className="h-64 flex flex-col overflow-hidden">
            <div className="border-b border-gray-800 bg-gray-900/50 px-4 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Interviewer Notes ({sessionData.interviewerNotes?.length || 0})
              </h3>
            </div>
            <div
              ref={notesRef}
              className="flex-1 overflow-y-auto p-3 space-y-2"
            >
              {(!sessionData.interviewerNotes ||
                sessionData.interviewerNotes.length === 0) ? (
                <p className="text-xs text-gray-600 text-center py-4">
                  No notes yet. Add timestamped observations below.
                </p>
              ) : (
                sessionData.interviewerNotes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded bg-gray-800 px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-500">
                        {note.interviewer.name}
                      </span>
                      <span className="text-[10px] text-gray-600">
                        {new Date(note.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">{note.content}</p>
                  </div>
                ))
              )}
            </div>
            <form
              onSubmit={handleNoteSubmit}
              className="border-t border-gray-800 p-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submittingNote || !noteContent.trim()}
                  className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar: AI Assist Control */}
      <div className="border-t border-gray-800 bg-gray-900 px-6 py-3 shrink-0">
        <div className="flex items-center gap-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 shrink-0">
            AI Assist Control
          </h4>

          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="4"
                value={showReasonInput ? pendingLevel : aiSliderValue}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between mt-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`text-[10px] ${
                      level === aiSliderValue ? "text-purple-400 font-medium" : "text-gray-600"
                    }`}
                  >
                    {aiLevelLabels[level]?.label}
                  </span>
                ))}
              </div>
            </div>

            {showReasonInput && (
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={aiSliderReason}
                  onChange={(e) => setAiSliderReason(e.target.value)}
                  placeholder="Reason for change..."
                  className="w-48 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={submitAiLevelChange}
                  disabled={!aiSliderReason.trim() || updatingAiLevel}
                  className="rounded bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
                >
                  {updatingAiLevel ? "..." : "Apply"}
                </button>
                <button
                  onClick={() => {
                    setShowReasonInput(false);
                    setAiSliderReason("");
                    setPendingLevel(aiSliderValue);
                  }}
                  className="rounded bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <span
            className={`text-sm font-mono font-bold shrink-0 ${
              aiLevelLabels[aiSliderValue]?.color || "text-gray-400"
            }`}
          >
            {aiLevelLabels[aiSliderValue]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
