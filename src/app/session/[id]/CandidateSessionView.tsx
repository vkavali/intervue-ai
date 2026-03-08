"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Editor from "@monaco-editor/react";
import SessionProtections from "@/components/SessionProtections";
import ScreenCapture from "@/components/ScreenCapture";
import SessionChat from "@/components/SessionChat";
import VideoCall from "@/components/VideoCall";

interface Question {
  id: string;
  title: string;
  description: string;
  constraints: string | null;
  examples: string | null;
  difficulty: string;
  aiLevel: number;
  timeLimit: number;
  orderIndex: number;
}

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
    interviewType?: string;
    defaultAiLevel: number;
    questions: Question[];
  };
  aiInteractions: {
    id: string;
    prompt: string;
    response: string;
    aiLevel: number;
    timestamp: string;
  }[];
}

interface CandidateSessionViewProps {
  sessionData: SessionData;
  sessionId: string;
  userId: string;
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-red-400" },
  1: { label: "L1 Hint", color: "text-yellow-400" },
  2: { label: "L2 Scaffold", color: "text-blue-400" },
  3: { label: "L3 Guide", color: "text-purple-400" },
  4: { label: "L4 Copilot", color: "text-green-400" },
};

const difficultyColors: Record<string, string> = {
  EASY: "text-green-400",
  MEDIUM: "text-yellow-400",
  HARD: "text-red-400",
};

export default function CandidateSessionView({ sessionData, sessionId, userId }: CandidateSessionViewProps) {
  const [code, setCode] = useState(sessionData.code || "// Start coding here...\n");
  const [language, setLanguage] = useState(sessionData.language || "javascript");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(sessionData.currentQuestionIndex || 0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const [runOutput, setRunOutput] = useState<{ output: string; error: string; exitCode: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const aiChatRef = useRef<HTMLDivElement>(null);

  // Calculate elapsed time from startedAt
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (sessionData.startedAt) {
      return Math.floor((Date.now() - new Date(sessionData.startedAt).getTime()) / 1000);
    }
    return 0;
  });

  const totalDurationSeconds = (sessionData.totalDurationMinutes || 0) * 60;

  // Load existing AI interactions
  useEffect(() => {
    if (sessionData.aiInteractions?.length > 0) {
      const messages = sessionData.aiInteractions.flatMap(
        (interaction) => [
          { role: "user" as const, content: interaction.prompt, timestamp: interaction.timestamp },
          { role: "assistant" as const, content: interaction.response, timestamp: interaction.timestamp },
        ]
      );
      setAiMessages(messages);
    }
  }, [sessionData.aiInteractions]);

  // Timer - counts from startedAt
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionData.startedAt) {
        const elapsed = Math.floor((Date.now() - new Date(sessionData.startedAt).getTime()) / 1000);
        setElapsedTime(elapsed);

        // Check time expiry
        if (totalDurationSeconds > 0 && elapsed >= totalDurationSeconds) {
          setTimeExpired(true);
        }
      } else {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionData.startedAt, totalDurationSeconds]);

  // Save code periodically
  const saveCode = useCallback(async () => {
    try {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
    } catch {
      // Silent fail for auto-save
    }
  }, [sessionId, code, language]);

  useEffect(() => {
    const interval = setInterval(saveCode, 5000);
    return () => clearInterval(interval);
  }, [saveCode]);

  // Handle AI prompt submission
  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading || timeExpired) return;

    const currentAiLevel = currentQuestion?.aiLevel ?? sessionData.aiLevel ?? 0;
    if (currentAiLevel === 0) return;

    const userMessage = {
      role: "user" as const,
      content: aiPrompt,
      timestamp: new Date().toISOString(),
    };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, code, questionIndex: currentQuestionIndex }),
      });
      const data = await res.json();
      setAiMessages((prev) => [...prev, {
        role: "assistant" as const,
        content: data.response || "No response generated.",
        timestamp: new Date().toISOString(),
      }]);
    } catch {
      setAiMessages((prev) => [...prev, {
        role: "assistant" as const,
        content: "Error: Failed to get AI response. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setAiLoading(false);
    }
  }

  // Scroll AI chat to bottom
  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  // Run code
  const runCode = useCallback(async () => {
    if (running || timeExpired) return;
    setRunning(true);
    setShowOutput(true);
    setRunOutput(null);
    try {
      if (language === "javascript" || language === "typescript") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setRunOutput(result);
        return;
      }
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (data.error === "USE_CLIENT_EXECUTION") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setRunOutput(result);
      } else if (res.ok) {
        setRunOutput(data);
      } else {
        setRunOutput({ output: "", error: data.error || "Execution failed", exitCode: 1 });
      }
    } catch {
      setRunOutput({ output: "", error: "Failed to connect to execution service", exitCode: 1 });
    } finally {
      setRunning(false);
    }
  }, [language, code, running, timeExpired]);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [runCode]);

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const questions = sessionData.template.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const currentAiLevel = currentQuestion?.aiLevel ?? sessionData.aiLevel;
  const isNonCoding = ["BEHAVIORAL", "BUSINESS_ANALYST", "PROJECT_MANAGEMENT"].includes(
    sessionData.template.interviewType || ""
  );
  const isSql = sessionData.template.interviewType === "SQL";
  const isSystemDesign = sessionData.template.interviewType === "SYSTEM_DESIGN";

  // Determine remaining time
  const remainingSeconds = totalDurationSeconds > 0 ? Math.max(0, totalDurationSeconds - elapsedTime) : null;
  const isLowTime = remainingSeconds !== null && remainingSeconds < 300; // less than 5 minutes

  return (
    <div className="flex h-screen flex-col bg-gray-950 overflow-hidden">
      <SessionProtections sessionId={sessionId} />
      {/* Time Expired Overlay */}
      {timeExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-red-500/30 bg-gray-900 p-8 text-center max-w-md">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-white mb-2">Time&apos;s Up!</h2>
            <p className="text-gray-400 mb-6">
              Your interview session has ended. Your code has been saved automatically.
            </p>
            <p className="text-sm text-gray-500">
              Total duration: {formatTime(totalDurationSeconds)}
            </p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2 shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-white">
            Intervue<span className="text-blue-400">.AI</span>
          </span>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-sm text-gray-300">{sessionData.template.title}</span>
        </div>

        <div className="flex items-center gap-4">
          <VideoCall sessionId={sessionId} userId={userId} />
          <ScreenCapture sessionId={sessionId} isInterviewer={false} />

          {/* Question Navigation */}
          <div className="flex items-center gap-1">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors ${
                  idx === currentQuestionIndex
                    ? "bg-purple-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          {!isNonCoding && (
            <select
              value={isSql ? "sql" : language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isSql}
              className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
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
            isLowTime ? "bg-red-900/50 border border-red-500/30" : "bg-gray-800"
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
          <span className={`rounded-full border border-gray-700 px-3 py-1 text-xs font-medium ${
            aiLevelLabels[currentAiLevel]?.color || "text-gray-400"
          }`}>
            {aiLevelLabels[currentAiLevel]?.label || `L${currentAiLevel}`}
          </span>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`relative rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
              showChat ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>

          {/* Run Button */}
          {!isNonCoding && (
            <button
              onClick={runCode}
              disabled={running || timeExpired}
              className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
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
              {running ? "Running..." : "Run"}
              <span className="text-green-300 text-[10px]">Ctrl+Enter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Question */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900/50 p-5">
          {currentQuestion ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-gray-500">
                  Q{currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className={`text-xs font-medium ${difficultyColors[currentQuestion.difficulty] || "text-gray-400"}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-gray-500">{currentQuestion.timeLimit} min</span>
              </div>

              <h2 className="text-lg font-bold text-white mb-4">{currentQuestion.title}</h2>

              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <p className="whitespace-pre-wrap leading-relaxed">{currentQuestion.description}</p>
                </div>
                {currentQuestion.constraints && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Constraints</h4>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                      {currentQuestion.constraints}
                    </pre>
                  </div>
                )}
                {currentQuestion.examples && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Examples</h4>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                      {currentQuestion.examples}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No question available</p>
          )}
        </div>

        {/* Center: Code Editor / Text Area + Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isNonCoding ? (
            /* Non-coding: Rich text area for behavioral/PM/BA */
            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={timeExpired}
                className="w-full h-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none font-mono text-sm"
                placeholder={isSystemDesign ? "Describe your system design here..." : "Type your answer here..."}
              />
            </div>
          ) : (
            <>
              <div className="flex-1">
                <Editor
                  height={showOutput ? "calc(100% - 200px)" : "100%"}
                  language={isSql ? "sql" : language}
                  value={code}
                  onChange={(value) => !timeExpired && setCode(value || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    fontFamily: "var(--font-geist-mono), monospace",
                    minimap: { enabled: false },
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorBlinking: "smooth",
                    renderLineHighlight: "all",
                    lineNumbers: "on",
                    tabSize: 2,
                    wordWrap: "on",
                    automaticLayout: true,
                    readOnly: timeExpired,
                  }}
                />
              </div>

              {/* Output Panel */}
              {showOutput && (
                <div className="h-[200px] border-t border-gray-800 bg-gray-900 flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400">Output</span>
                      {runOutput && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${runOutput.exitCode === 0 ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                          {runOutput.exitCode === 0 ? "Success" : `Exit: ${runOutput.exitCode}`}
                        </span>
                      )}
                    </div>
                    <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-gray-300 text-xs">Close</button>
                  </div>
                  <div className="flex-1 overflow-auto p-3">
                    {running ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running code...
                      </div>
                    ) : runOutput ? (
                      <pre className="font-mono text-xs whitespace-pre-wrap">
                        {runOutput.output && <span className="text-gray-300">{runOutput.output}</span>}
                        {runOutput.error && <span className="text-red-400">{runOutput.error}</span>}
                        {!runOutput.output && !runOutput.error && <span className="text-gray-500">No output</span>}
                      </pre>
                    ) : null}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat Panel (collapsible) */}
        {showChat && (
          <div className="w-72 shrink-0 border-l border-gray-800">
            <SessionChat sessionId={sessionId} userId={userId} />
          </div>
        )}

        {/* Right Panel: AI Sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-l border-gray-800 bg-gray-900/50">
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              <span className={`text-xs font-medium ${aiLevelLabels[currentAiLevel]?.color || "text-gray-400"}`}>
                {aiLevelLabels[currentAiLevel]?.label}
              </span>
            </div>
            {currentAiLevel === 0 && (
              <p className="text-xs text-red-400 mt-1">AI assistance is disabled for this question.</p>
            )}
          </div>

          {/* Chat Messages */}
          <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.length === 0 && currentAiLevel > 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="mt-2 text-xs text-gray-500">Ask the AI for help with your solution.</p>
              </div>
            )}

            {aiMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                    : "bg-gray-800 text-gray-300 border border-gray-700"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="block mt-1 text-[10px] text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {aiLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleAiSubmit} className="border-t border-gray-800 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={currentAiLevel === 0 || timeExpired}
                placeholder={
                  timeExpired ? "Session ended"
                    : currentAiLevel === 0 ? "AI disabled for this question"
                    : "Ask the AI for help..."
                }
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={currentAiLevel === 0 || aiLoading || !aiPrompt.trim() || timeExpired}
                className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
