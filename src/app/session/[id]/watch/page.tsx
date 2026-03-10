"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import ScreenCapture from "@/components/ScreenCapture";
import VideoCall from "@/components/VideoCall";
import SessionChat from "@/components/SessionChat";

interface SessionData {
  id: string;
  status: string;
  interviewerId: string | null;
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

interface ThinkingAnalysis {
  overallApproach: string;
  thinkingPatterns: {
    pattern: string;
    evidence: string;
    strength: 'positive' | 'neutral' | 'concerning';
  }[];
  problemSolvingStage: string;
  strengths: string[];
  concerns: string[];
  aiUsagePattern: string;
  suggestedFollowUp: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
}

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-red-400" },
  1: { label: "L1 Hint", color: "text-yellow-400" },
  2: { label: "L2 Scaffold", color: "text-blue-400" },
  3: { label: "L3 Guide", color: "text-saffron" },
  4: { label: "L4 Copilot", color: "text-green-400" },
};

const strengthColors: Record<string, string> = {
  positive: "text-green-400 border-green-800 bg-green-950",
  neutral: "text-yellow-400 border-yellow-800 bg-yellow-950",
  concerning: "text-red-400 border-red-800 bg-red-950",
};

const strengthDotColors: Record<string, string> = {
  positive: "bg-green-400",
  neutral: "bg-yellow-400",
  concerning: "bg-red-400",
};

const confidenceColors: Record<string, string> = {
  high: "text-green-400 bg-green-950 border-green-800",
  medium: "text-yellow-400 bg-yellow-950 border-yellow-800",
  low: "text-red-400 bg-red-950 border-red-800",
};

const stageBadgeColors: Record<string, string> = {
  understanding: "text-blue-300 bg-blue-950 border-blue-800",
  planning: "text-saffron-light bg-editor-surface border-saffron-dark",
  implementing: "text-green-300 bg-green-950 border-green-800",
  debugging: "text-orange-300 bg-orange-950 border-orange-800",
  optimizing: "text-cyan-300 bg-cyan-950 border-cyan-800",
};

export default function WatchSessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiSliderValue, setAiSliderValue] = useState(0);
  const [aiSliderReason, setAiSliderReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingLevel, setPendingLevel] = useState(0);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingAiLevel, setUpdatingAiLevel] = useState(false);
  const [thinkingAnalysis, setThinkingAnalysis] = useState<ThinkingAnalysis | null>(null);
  const [thinkingLoading, setThinkingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'interactions' | 'thinking' | 'chat'>('interactions');
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
    // Fetch current user for VideoCall
    fetch("/api/auth/me").then(r => r.ok ? r.json() : null).then(u => {
      if (u?.id) setUserId(u.id);
    }).catch(() => {});
  }, [fetchSession]);

  // Poll every 2 seconds
  useEffect(() => {
    const interval = setInterval(fetchSession, 1000);
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

  // Fetch thinking analysis
  async function fetchThinkingAnalysis() {
    setThinkingLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/thinking`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setThinkingAnalysis(data);
      }
    } catch {
      /* silent */
    } finally {
      setThinkingLoading(false);
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
          <svg className="animate-spin h-8 w-8 text-saffron mx-auto mb-4" viewBox="0 0 24 24">
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

  const stageLower = thinkingAnalysis?.problemSolvingStage?.toLowerCase() || "";
  const stageBadgeClass =
    stageBadgeColors[stageLower] || "text-gray-300 bg-gray-900 border-gray-700";

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
          {/* Video Call — only for the actual interviewer, not admin observers */}
          {userId && sessionData.interviewerId === userId && <VideoCall sessionId={sessionId} userId={userId} isInterviewer={true} />}
          {/* Screen Capture Button (interviewer view) */}
          <ScreenCapture sessionId={sessionId} isInterviewer={true} />

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

        {/* Right: AI Log / Thinking Analysis + Notes */}
        <div className="w-96 shrink-0 flex flex-col overflow-hidden">
          {/* Tabbed Top Section */}
          <div className="flex-1 flex flex-col border-b border-gray-800 overflow-hidden">
            {/* Tab Buttons */}
            <div className="flex border-b border-gray-800 bg-gray-900/50 shrink-0">
              <button
                onClick={() => setActiveTab('interactions')}
                className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'interactions'
                    ? 'text-saffron border-b-2 border-saffron bg-gray-900/80'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                AI Interactions ({sessionData.aiInteractions.length})
              </button>
              <button
                onClick={() => setActiveTab('thinking')}
                className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'thinking'
                    ? 'text-saffron border-b-2 border-saffron bg-gray-900/80'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Thinking Analysis
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'chat'
                    ? 'text-saffron border-b-2 border-saffron bg-gray-900/80'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Chat
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'chat' ? (
              <div className="flex-1 overflow-hidden">
                {userId ? (
                  <SessionChat sessionId={sessionId} userId={userId} />
                ) : (
                  <p className="text-xs text-gray-600 text-center py-8">Loading chat...</p>
                )}
              </div>
            ) : activeTab === 'interactions' ? (
              /* AI Interaction Log */
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
            ) : (
              /* Thinking Analysis Tab */
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Analyze Button */}
                <button
                  onClick={fetchThinkingAnalysis}
                  disabled={thinkingLoading}
                  className="w-full rounded-lg border border-saffron-dark bg-editor-surface px-4 py-2 text-xs font-medium text-saffron-light hover:bg-saffron/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {thinkingLoading ? (
                    <>
                      <svg className="animate-spin h-3 w-3 text-saffron" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Thinking
                    </>
                  )}
                </button>

                {!thinkingAnalysis && !thinkingLoading && (
                  <p className="text-xs text-gray-600 text-center py-6">
                    Click &quot;Analyze Thinking&quot; to generate an AI-powered analysis of the candidate&apos;s problem-solving approach.
                  </p>
                )}

                {thinkingAnalysis && (
                  <div className="space-y-3">
                    {/* Overall Approach */}
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-1.5">
                        Overall Approach
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {thinkingAnalysis.overallApproach}
                      </p>
                    </div>

                    {/* Problem-Solving Stage + Confidence */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 rounded-lg border border-gray-800 bg-gray-900 p-2.5 flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 shrink-0">Stage:</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${stageBadgeClass}`}>
                          {thinkingAnalysis.problemSolvingStage}
                        </span>
                      </div>
                      <div className="rounded-lg border border-gray-800 bg-gray-900 p-2.5 flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-gray-500">Confidence:</span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${confidenceColors[thinkingAnalysis.confidenceLevel]}`}>
                          {thinkingAnalysis.confidenceLevel}
                        </span>
                      </div>
                    </div>

                    {/* Thinking Patterns */}
                    {thinkingAnalysis.thinkingPatterns.length > 0 && (
                      <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-2">
                          Thinking Patterns
                        </h4>
                        <div className="space-y-2">
                          {thinkingAnalysis.thinkingPatterns.map((tp, i) => (
                            <div
                              key={i}
                              className={`rounded border p-2 ${strengthColors[tp.strength]}`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${strengthDotColors[tp.strength]}`} />
                                <span className="text-[10px] font-medium">
                                  {tp.pattern}
                                </span>
                              </div>
                              <p className="text-[10px] opacity-80 pl-3">
                                {tp.evidence}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {thinkingAnalysis.strengths.length > 0 && (
                      <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-400 mb-2">
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {thinkingAnalysis.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 mt-1 shrink-0" />
                              <span className="text-xs text-gray-300">{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Concerns */}
                    {thinkingAnalysis.concerns.length > 0 && (
                      <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-2">
                          Concerns
                        </h4>
                        <ul className="space-y-1">
                          {thinkingAnalysis.concerns.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400 mt-1 shrink-0" />
                              <span className="text-xs text-gray-300">{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* AI Usage Pattern */}
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-1.5">
                        AI Usage Pattern
                      </h4>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {thinkingAnalysis.aiUsagePattern}
                      </p>
                    </div>

                    {/* Suggested Follow-Up Questions */}
                    {thinkingAnalysis.suggestedFollowUp.length > 0 && (
                      <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-2">
                          Suggested Follow-Up Questions
                        </h4>
                        <ol className="space-y-1.5">
                          {thinkingAnalysis.suggestedFollowUp.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[10px] text-saffron font-mono font-bold shrink-0 mt-px">
                                {i + 1}.
                              </span>
                              <span className="text-xs text-gray-300">{q}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes Panel (unchanged) */}
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
                  className="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-saffron focus:outline-none"
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
                className="w-full accent-saffron"
              />
              <div className="flex justify-between mt-1">
                {[0, 1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`text-[10px] ${
                      level === aiSliderValue ? "text-saffron font-medium" : "text-gray-600"
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
                  className="w-48 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-saffron focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={submitAiLevelChange}
                  disabled={!aiSliderReason.trim() || updatingAiLevel}
                  className="rounded border border-saffron bg-transparent px-3 py-1.5 text-xs font-medium text-saffron hover:bg-saffron/10 disabled:opacity-50 transition-colors"
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
