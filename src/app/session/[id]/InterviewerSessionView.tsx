"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import ScreenCapture from "@/components/ScreenCapture";
import SessionChat from "@/components/SessionChat";
import VideoCall from "@/components/VideoCall";
import Logo from "@/components/Logo";

interface SessionData {
  id: string;
  status: string;
  currentQuestionIndex: number;
  code: string | null;
  language: string | null;
  aiLevel: number;
  startedAt: string | null;
  totalDurationMinutes: number | null;
  template: {
    title: string;
    role: string;
    seniority: string;
    interviewType?: string;
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
  candidate: { id: string; name: string; email: string };
  interviewer: { id: string; name: string; email: string } | null;
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

interface ViolationRecord {
  id: string;
  type: string;
  details: string | null;
  timestamp: string;
}

interface ThinkingAnalysis {
  overallApproach: string;
  thinkingPatterns: {
    pattern: string;
    evidence: string;
    strength: "positive" | "neutral" | "concerning";
  }[];
  problemSolvingStage: string;
  strengths: string[];
  concerns: string[];
  aiUsagePattern: string;
  suggestedFollowUp: string[];
  confidenceLevel: "high" | "medium" | "low";
}

interface InterviewerSessionViewProps {
  sessionData: SessionData;
  sessionId: string;
  userId: string;
  isActualInterviewer?: boolean;
}

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-red-400" },
  1: { label: "L1 Hint", color: "text-yellow-400" },
  2: { label: "L2 Scaffold", color: "text-blue-400" },
  3: { label: "L3 Guide", color: "text-india-green-light" },
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

type TabType = "interactions" | "violations" | "notes" | "thinking" | "chat";

export default function InterviewerSessionView({
  sessionData: initialData,
  sessionId,
  userId,
  isActualInterviewer = true,
}: InterviewerSessionViewProps) {
  const [sessionData, setSessionData] = useState(initialData);
  const [aiSliderValue, setAiSliderValue] = useState(initialData.aiLevel);
  const [aiSliderReason, setAiSliderReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [pendingLevel, setPendingLevel] = useState(0);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingAiLevel, setUpdatingAiLevel] = useState(false);
  const [thinkingAnalysis, setThinkingAnalysis] = useState<ThinkingAnalysis | null>(null);
  const [thinkingLoading, setThinkingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("interactions");
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [prevViolationCount, setPrevViolationCount] = useState(0);
  const [violationAlert, setViolationAlert] = useState(false);
  const [candidateOnline, setCandidateOnline] = useState(false);
  const [candidateEditing, setCandidateEditing] = useState(false);
  const [lastEditTime, setLastEditTime] = useState<string | null>(null);
  const prevCodeRef = useRef(initialData.code);
  const interactionLogRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  // Poll session data every 2s
  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        // Detect if candidate is editing (code changed since last poll)
        if (data.code !== prevCodeRef.current) {
          setCandidateEditing(true);
          setLastEditTime(new Date().toLocaleTimeString());
          prevCodeRef.current = data.code;
          // Reset editing indicator after 3s of no changes
          setTimeout(() => setCandidateEditing(false), 3000);
        }
        // Consider candidate online if session is ACTIVE and has recent logs
        setCandidateOnline(data.status === "ACTIVE");
        setSessionData(data);
      }
    } catch {
      /* silent */
    }
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(fetchSession, 1000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // Poll violations every 5s
  const fetchViolations = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/violations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          if (data.length > prevViolationCount) {
            setViolationAlert(true);
            setTimeout(() => setViolationAlert(false), 3000);
          }
          setPrevViolationCount(data.length);
          setViolations(data);
        }
      }
    } catch {
      /* silent */
    }
  }, [sessionId, prevViolationCount]);

  useEffect(() => {
    fetchViolations();
    const interval = setInterval(fetchViolations, 5000);
    return () => clearInterval(interval);
  }, [fetchViolations]);

  // Auto-scroll interaction log
  useEffect(() => {
    if (interactionLogRef.current) {
      interactionLogRef.current.scrollTop = interactionLogRef.current.scrollHeight;
    }
  }, [sessionData.aiInteractions]);

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
        body: JSON.stringify({ newLevel: pendingLevel, reason: aiSliderReason }),
      });
      if (res.ok) {
        setAiSliderValue(pendingLevel);
        setShowReasonInput(false);
        setAiSliderReason("");
        fetchSession();
      }
    } catch {
      /* silent */
    } finally {
      setUpdatingAiLevel(false);
    }
  }

  // Fetch thinking analysis
  async function fetchThinkingAnalysis() {
    setThinkingLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/thinking`, { method: "POST" });
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
      /* silent */
    } finally {
      setSubmittingNote(false);
    }
  }

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const currentQuestion = sessionData.template.questions[sessionData.currentQuestionIndex];
  const elapsedSeconds = sessionData.startedAt
    ? Math.floor((Date.now() - new Date(sessionData.startedAt).getTime()) / 1000)
    : 0;

  return (
    <div className="flex h-screen flex-col bg-editor overflow-hidden">
      {/* Violation Alert Toast */}
      {violationAlert && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-right">
          <div className="rounded-lg border border-red-500/50 bg-red-900/90 backdrop-blur-sm px-4 py-3 shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-red-200 font-medium">New violation detected!</span>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-editor-border bg-editor-panel px-4 py-2 shrink-0">
        <div className="flex items-center gap-4">
          <Logo size="sm" variant="dark" href={false} />
          <span className="text-xs text-gray-500">|</span>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${candidateOnline ? "bg-green-400" : "bg-gray-500"}`} />
            <span className="text-sm text-gray-300">{sessionData.candidate.name}</span>
            {candidateEditing && (
              <span className="text-[10px] text-yellow-400 animate-pulse">editing...</span>
            )}
            {lastEditTime && !candidateEditing && (
              <span className="text-[10px] text-gray-600">last edit {lastEditTime}</span>
            )}
          </div>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-sm text-gray-400">{sessionData.template.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {isActualInterviewer && <VideoCall sessionId={sessionId} userId={userId} isInterviewer={true} />}
          <ScreenCapture sessionId={sessionId} isInterviewer={true} />

          {/* Elapsed Timer */}
          {sessionData.startedAt && (
            <div className="flex items-center gap-2 rounded-lg bg-editor-surface px-3 py-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-mono text-gray-300">{formatTime(elapsedSeconds)}</span>
              {sessionData.totalDurationMinutes && (
                <span className="text-xs text-gray-500">/ {sessionData.totalDurationMinutes}m</span>
              )}
            </div>
          )}

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className={`relative flex h-2.5 w-2.5 ${sessionData.status === "ACTIVE" ? "" : "opacity-50"}`}>
              {sessionData.status === "ACTIVE" && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                sessionData.status === "ACTIVE" ? "bg-green-500" : "bg-gray-500"
              }`} />
            </span>
            <span className={`text-xs font-medium ${sessionData.status === "ACTIVE" ? "text-green-400" : "text-gray-400"}`}>
              {sessionData.status}
            </span>
          </div>

          {/* Violations Count */}
          {violations.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-xs font-medium text-red-400">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
              </svg>
              {violations.length} violations
            </span>
          )}

          {currentQuestion && (
            <span className="text-xs text-gray-500">
              Q{sessionData.currentQuestionIndex + 1}/{sessionData.template.questions.length}: {currentQuestion.title}
            </span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Code Editor (read-only) */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-editor-border">
          <div className="flex items-center justify-between border-b border-editor-border bg-editor-panel/50 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">Candidate&apos;s Code</span>
              <span className="text-xs text-gray-600">(read-only)</span>
            </div>
            <span className="text-xs text-gray-500">{sessionData.language || "javascript"}</span>
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

        {/* Right: Tabbed Panel */}
        <div className="w-96 shrink-0 flex flex-col overflow-hidden">
          {/* Tab Buttons */}
          <div className="flex border-b border-editor-border bg-editor-panel/50 shrink-0 overflow-x-auto">
            {(["interactions", "violations", "notes", "thinking", "chat"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-saffron border-b-2 border-saffron bg-editor-panel/80"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab === "interactions" && `AI (${sessionData.aiInteractions.length})`}
                {tab === "violations" && (
                  <>
                    Violations
                    {violations.length > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-[9px] text-white font-bold">
                        {violations.length}
                      </span>
                    )}
                  </>
                )}
                {tab === "notes" && `Notes (${sessionData.interviewerNotes?.length || 0})`}
                {tab === "thinking" && "Thinking"}
                {tab === "chat" && "Chat"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "interactions" && (
              <div ref={interactionLogRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                {sessionData.aiInteractions.length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-8">No AI interactions yet.</p>
                ) : (
                  sessionData.aiInteractions.map((interaction) => (
                    <div key={interaction.id} className="rounded-lg border border-editor-border bg-editor-panel p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-medium ${aiLevelLabels[interaction.aiLevel]?.color || "text-gray-400"}`}>
                          {aiLevelLabels[interaction.aiLevel]?.label}
                        </span>
                        <span className="text-[10px] text-gray-600">{new Date(interaction.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-[10px] text-gray-500 block">Candidate:</span>
                          <p className="text-xs text-blue-300">{interaction.prompt}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">AI:</span>
                          <p className="text-xs text-gray-300 whitespace-pre-wrap">
                            {interaction.response.length > 300 ? interaction.response.substring(0, 300) + "..." : interaction.response}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "violations" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {violations.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-600 mt-2">No violations detected.</p>
                  </div>
                ) : (
                  violations.map((v) => (
                    <div key={v.id} className="rounded-lg border border-red-800/50 bg-red-950/30 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-red-400">{v.type.replace(/_/g, " ")}</span>
                        <span className="text-[10px] text-gray-600">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {v.details && <p className="text-[10px] text-gray-400">{v.details}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div ref={notesRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                  {(!sessionData.interviewerNotes || sessionData.interviewerNotes.length === 0) ? (
                    <p className="text-xs text-gray-600 text-center py-4">No notes yet. Add observations below.</p>
                  ) : (
                    sessionData.interviewerNotes.map((note) => (
                      <div key={note.id} className="rounded bg-editor-surface px-3 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500">{note.interviewer.name}</span>
                          <span className="text-[10px] text-gray-600">{new Date(note.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-gray-300">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleNoteSubmit} className="border-t border-editor-border p-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 rounded border border-editor-border bg-editor-surface px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-saffron focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={submittingNote || !noteContent.trim()}
                      className="rounded bg-editor-hover px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-editor-muted disabled:opacity-50 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "thinking" && (
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <button
                  onClick={fetchThinkingAnalysis}
                  disabled={thinkingLoading}
                  className="w-full rounded-lg border border-saffron-dark bg-editor-surface px-4 py-2 text-xs font-medium text-saffron-light hover:bg-editor-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
                    Click &quot;Analyze Thinking&quot; to generate an AI-powered analysis.
                  </p>
                )}

                {thinkingAnalysis && (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-editor-border bg-editor-panel p-3">
                      <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-1.5">Overall Approach</h4>
                      <p className="text-xs text-gray-300 leading-relaxed">{thinkingAnalysis.overallApproach}</p>
                    </div>

                    {thinkingAnalysis.thinkingPatterns.length > 0 && (
                      <div className="rounded-lg border border-editor-border bg-editor-panel p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-2">Thinking Patterns</h4>
                        <div className="space-y-2">
                          {thinkingAnalysis.thinkingPatterns.map((tp, i) => (
                            <div key={i} className={`rounded border p-2 ${strengthColors[tp.strength]}`}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full ${strengthDotColors[tp.strength]}`} />
                                <span className="text-[10px] font-medium">{tp.pattern}</span>
                              </div>
                              <p className="text-[10px] opacity-80 pl-3">{tp.evidence}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {thinkingAnalysis.strengths.length > 0 && (
                      <div className="rounded-lg border border-editor-border bg-editor-panel p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-400 mb-2">Strengths</h4>
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

                    {thinkingAnalysis.concerns.length > 0 && (
                      <div className="rounded-lg border border-editor-border bg-editor-panel p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-2">Concerns</h4>
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

                    {thinkingAnalysis.suggestedFollowUp.length > 0 && (
                      <div className="rounded-lg border border-editor-border bg-editor-panel p-3">
                        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-saffron mb-2">Follow-Up Questions</h4>
                        <ol className="space-y-1.5">
                          {thinkingAnalysis.suggestedFollowUp.map((q, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-[10px] text-saffron font-mono font-bold shrink-0 mt-px">{i + 1}.</span>
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

            {activeTab === "chat" && (
              <div className="flex-1 overflow-hidden">
                <SessionChat sessionId={sessionId} userId={userId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: AI Assist Control */}
      <div className="border-t border-editor-border bg-editor-panel px-6 py-3 shrink-0">
        <div className="flex items-center gap-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 shrink-0">AI Assist Control</h4>
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
                  <span key={level} className={`text-[10px] ${level === aiSliderValue ? "text-saffron font-medium" : "text-gray-600"}`}>
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
                  className="w-48 rounded border border-editor-border bg-editor-surface px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-saffron focus:outline-none"
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
                  onClick={() => { setShowReasonInput(false); setAiSliderReason(""); setPendingLevel(aiSliderValue); }}
                  className="rounded bg-editor-hover px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-editor-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <span className={`text-sm font-mono font-bold shrink-0 ${aiLevelLabels[aiSliderValue]?.color || "text-gray-400"}`}>
            {aiLevelLabels[aiSliderValue]?.label}
          </span>
        </div>
      </div>
    </div>
  );
}
