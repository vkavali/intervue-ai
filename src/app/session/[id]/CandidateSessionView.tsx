"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import SessionProtections from "@/components/SessionProtections";
import SessionChat from "@/components/SessionChat";
import ResizablePanelLayout from "@/components/editor/ResizablePanelLayout";
import SessionTopBar from "@/components/editor/SessionTopBar";
import QuestionPanel from "@/components/editor/QuestionPanel";
import EditorPanel from "@/components/editor/EditorPanel";
import AIPanel from "@/components/editor/AIPanel";
import BottomPanel, { type TestResult } from "@/components/editor/BottomPanel";
import { type EditorSettings, getEditorSettings } from "@/lib/editor-settings";
import { isNonCodingType } from "@/data/interview-types";
import {
  connectSocket,
  disconnectSocket,
  isConnected,
  emitCodeUpdate,
  emitCursorPosition,
  type AiLevelChangedEvent,
  type ChatMessageEvent,
} from "@/lib/socket-client";

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
  testCases: string | null;
  starterCode: string | null;
}

interface TestCase {
  input: string;
  expected: string;
  custom?: boolean;
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
  3: { label: "L3 Guide", color: "text-india-green-light" },
  4: { label: "L4 Copilot", color: "text-green-400" },
};

function getStarterCode(question: Question, lang: string): string {
  if (!question.starterCode) return "";
  try {
    const parsed = JSON.parse(question.starterCode);
    return parsed[lang] || "";
  } catch {
    return "";
  }
}

function parseTestCases(question: Question): TestCase[] {
  if (!question.testCases) return [];
  try {
    const parsed = JSON.parse(question.testCases);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export default function CandidateSessionView({ sessionData, sessionId, userId }: CandidateSessionViewProps) {
  const questions = sessionData.template.questions;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(sessionData.currentQuestionIndex || 0);
  const currentQuestion = questions[currentQuestionIndex];

  // Per-question code storage
  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (sessionData.code) {
      const lang = sessionData.language || "javascript";
      map[`${sessionData.currentQuestionIndex || 0}-${lang}`] = sessionData.code;
    }
    return map;
  });
  const [language, setLanguage] = useState(sessionData.language || "javascript");

  const code = useMemo(() => {
    const key = `${currentQuestionIndex}-${language}`;
    if (codeMap[key] !== undefined) return codeMap[key];
    if (currentQuestion) {
      const starter = getStarterCode(currentQuestion, language);
      if (starter) return starter;
    }
    return "// Start coding here...\n";
  }, [codeMap, currentQuestionIndex, language, currentQuestion]);

  const setCode = useCallback((newCode: string) => {
    const key = `${currentQuestionIndex}-${language}`;
    setCodeMap(prev => ({ ...prev, [key]: newCode }));
  }, [currentQuestionIndex, language]);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);

  // Execution state
  const [runOutput, setRunOutput] = useState<{ output: string; error: string; exitCode: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [streamProgress, setStreamProgress] = useState<{ completed: number; total: number } | null>(null);

  // UI state
  const [showChat, setShowChat] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(getEditorSettings);
  const [socketConnected, setSocketConnected] = useState(false);

  // Custom test cases per question
  const [customTestCases, setCustomTestCases] = useState<Record<number, TestCase[]>>({});

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const snapshotTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Merged test cases (parsed + custom)
  const testCases = useMemo(() => {
    const parsed = parseTestCases(currentQuestion);
    const custom = customTestCases[currentQuestionIndex] || [];
    return [...parsed, ...custom];
  }, [currentQuestion, currentQuestionIndex, customTestCases]);

  // Question progress tracking
  const questionProgress = useMemo(() => {
    const progress = new Map<number, "empty" | "started" | "passed">();
    for (let i = 0; i < questions.length; i++) {
      const hasCode = Object.keys(codeMap).some(k => k.startsWith(`${i}-`));
      // Check if we have passing test results for the current question
      if (i === currentQuestionIndex && testResults && testResults.every(r => r.passed) && testResults.length > 0) {
        progress.set(i, "passed");
      } else if (hasCode) {
        progress.set(i, "started");
      } else {
        progress.set(i, "empty");
      }
    }
    return progress;
  }, [questions, codeMap, currentQuestionIndex, testResults]);

  // Timer
  const [elapsedTime, setElapsedTime] = useState(() => {
    if (sessionData.startedAt) {
      return Math.floor((Date.now() - new Date(sessionData.startedAt).getTime()) / 1000);
    }
    return 0;
  });
  const totalDurationSeconds = (sessionData.totalDurationMinutes || 0) * 60;

  // AI level (can be overridden via socket)
  const [aiLevelOverride, setAiLevelOverride] = useState<number | null>(null);
  const currentAiLevel = aiLevelOverride ?? currentQuestion?.aiLevel ?? sessionData.aiLevel;

  const isNonCoding = isNonCodingType(sessionData.template.interviewType || "");
  const isSql = sessionData.template.interviewType === "SQL";
  const isSystemDesign = sessionData.template.interviewType === "SYSTEM_DESIGN";
  const remainingSeconds = totalDurationSeconds > 0 ? Math.max(0, totalDurationSeconds - elapsedTime) : null;
  const isLowTime = remainingSeconds !== null && remainingSeconds < 300;

  // ─── Effects ────────────────────────────────────────────────────────────────

  // Load AI interactions
  useEffect(() => {
    if (sessionData.aiInteractions?.length > 0) {
      const messages = sessionData.aiInteractions.flatMap(interaction => [
        { role: "user" as const, content: interaction.prompt, timestamp: interaction.timestamp },
        { role: "assistant" as const, content: interaction.response, timestamp: interaction.timestamp },
      ]);
      setAiMessages(messages);
    }
  }, [sessionData.aiInteractions]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionData.startedAt) {
        const elapsed = Math.floor((Date.now() - new Date(sessionData.startedAt).getTime()) / 1000);
        setElapsedTime(elapsed);
        if (totalDurationSeconds > 0 && elapsed >= totalDurationSeconds) {
          setTimeExpired(true);
        }
      } else {
        setElapsedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionData.startedAt, totalDurationSeconds]);

  // Save code (debounced HTTP PATCH + socket emit)
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // HTTP persistence (always)
      fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      }).catch(() => {});

      // Socket emit for live updates
      emitCodeUpdate(code, language, currentQuestionIndex);
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [sessionId, code, language, currentQuestionIndex]);

  // Socket.io connection
  useEffect(() => {
    const socket = connectSocket(sessionId, userId);

    if (socket) {
      const checkConnection = setInterval(() => {
        setSocketConnected(isConnected());
      }, 2000);

      // Listen for AI level changes from interviewer
      socket.on("ai-level-changed", (data: AiLevelChangedEvent) => {
        setAiLevelOverride(data.newLevel);
      });

      // Listen for chat messages via socket (instant)
      socket.on("chat-message", (_data: ChatMessageEvent) => {
        // SessionChat component handles its own state,
        // but socket makes it instant vs 3s polling
      });

      return () => {
        clearInterval(checkConnection);
        disconnectSocket();
      };
    }
  }, [sessionId, userId]);

  // Snapshot saving — every 30s for session playback
  useEffect(() => {
    snapshotTimerRef.current = setInterval(() => {
      if (code && code !== "// Start coding here...\n") {
        fetch(`/api/sessions/${sessionId}/snapshots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language, questionIndex: currentQuestionIndex }),
        }).catch(() => {});
      }
    }, 30_000);

    return () => {
      if (snapshotTimerRef.current) clearInterval(snapshotTimerRef.current);
    };
  }, [sessionId, code, language, currentQuestionIndex]);

  // Navigation guard — warn before leaving an active session
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (timeExpired) return; // already ended, no need to warn
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [timeExpired]);

  // Reset test results on question change
  useEffect(() => {
    setTestResults(null);
    setRunOutput(null);
    setStreamProgress(null);
  }, [currentQuestionIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        runTests();
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleAiSubmit = useCallback(async (prompt: string) => {
    if (aiLoading || timeExpired || currentAiLevel === 0) return;

    const userMessage = {
      role: "user" as const,
      content: prompt,
      timestamp: new Date().toISOString(),
    };
    setAiMessages(prev => [...prev, userMessage]);
    setAiLoading(true);

    try {
      const res = await fetch(`/api/sessions/${sessionId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, code, questionIndex: currentQuestionIndex }),
      });
      const data = await res.json();
      setAiMessages(prev => [...prev, {
        role: "assistant" as const,
        content: data.response || "No response generated.",
        timestamp: new Date().toISOString(),
      }]);
    } catch {
      setAiMessages(prev => [...prev, {
        role: "assistant" as const,
        content: "Error: Failed to get AI response. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, timeExpired, currentAiLevel, sessionId, code, currentQuestionIndex]);

  const runCode = useCallback(async () => {
    if (running || runningTests || timeExpired) return;
    setRunning(true);
    setBottomPanelOpen(true);
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
  }, [language, code, running, runningTests, timeExpired]);

  const runTests = useCallback(async () => {
    if (running || runningTests || timeExpired) return;
    if (testCases.length === 0) return;

    // For JS/TS, use client-side execution
    if (language === "javascript" || language === "typescript") {
      setRunningTests(true);
      setBottomPanelOpen(true);
      setTestResults(null);
      setStreamProgress({ completed: 0, total: testCases.length });

      const { runJavaScriptInWorker } = await import("@/lib/code-runner");
      const results: TestResult[] = [];

      for (const tc of testCases) {
        const startTime = Date.now();
        const testCode = `${code}\nconsole.log(JSON.stringify(${tc.input}));`;
        try {
          const result = await runJavaScriptInWorker(testCode);
          const runtime = Date.now() - startTime;
          const actual = result.output.trim();
          let passed = false;
          try {
            const actualParsed = JSON.stringify(JSON.parse(actual));
            const expectedParsed = JSON.stringify(JSON.parse(tc.expected));
            passed = actualParsed === expectedParsed;
          } catch {
            passed = actual === tc.expected.trim();
          }
          results.push({
            input: tc.input,
            expected: tc.expected,
            actual: result.error ? `Error: ${result.error}` : actual,
            passed: result.error ? false : passed,
            runtime,
          });
        } catch {
          results.push({
            input: tc.input,
            expected: tc.expected,
            actual: "Execution error",
            passed: false,
            runtime: Date.now() - startTime,
          });
        }
        // Update streaming progress
        setTestResults([...results]);
        setStreamProgress({ completed: results.length, total: testCases.length });
      }

      setTestResults(results);
      setRunningTests(false);
      setStreamProgress(null);
      return;
    }

    // For other languages, try streaming SSE endpoint first
    setRunningTests(true);
    setBottomPanelOpen(true);
    setTestResults(null);
    setStreamProgress({ completed: 0, total: testCases.length });

    try {
      const res = await fetch("/api/execute/run-tests-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, testCases }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const results: TestResult[] = [];
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === "result") {
                  results.push({
                    input: event.input,
                    expected: event.expected,
                    actual: event.actual,
                    passed: event.passed,
                    runtime: event.runtime,
                  });
                  setTestResults([...results]);
                  setStreamProgress({ completed: results.length, total: testCases.length });
                }
              } catch {}
            }
          }
        }

        setTestResults(results);
      } else {
        // Fallback to non-streaming endpoint
        const fallbackRes = await fetch("/api/execute/run-tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ language, code, testCases }),
        });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setTestResults(data.results);
        } else {
          setTestResults([]);
        }
      }
    } catch {
      setTestResults([]);
    }

    setRunningTests(false);
    setStreamProgress(null);
  }, [language, code, running, runningTests, timeExpired, testCases]);

  const handleResetCode = useCallback(() => {
    if (!currentQuestion) return;
    const starter = getStarterCode(currentQuestion, language);
    setCode(starter || "// Start coding here...\n");
    setShowResetConfirm(false);
  }, [currentQuestion, language, setCode]);

  const handleAddTestCase = useCallback((tc: TestCase) => {
    setCustomTestCases(prev => ({
      ...prev,
      [currentQuestionIndex]: [...(prev[currentQuestionIndex] || []), tc],
    }));
  }, [currentQuestionIndex]);

  const handleCursorPosition = useCallback((lineNumber: number, column: number) => {
    emitCursorPosition(lineNumber, column);
  }, []);

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col bg-editor overflow-hidden">
      <SessionProtections sessionId={sessionId} />

      {/* Reset Code Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border border-editor-border bg-editor-panel p-6 text-center max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Reset Code?</h3>
            <p className="text-sm text-gray-400 mb-5">
              This will replace your current code with the starter template. This cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-editor-border bg-editor-surface px-4 py-2 text-sm text-gray-300 hover:bg-editor-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetCode}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Expired Overlay */}
      {timeExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-red-500/30 bg-editor-panel p-8 text-center max-w-md">
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

      {/* Top Bar with Timer Progress */}
      <SessionTopBar
        templateTitle={sessionData.template.title}
        sessionId={sessionId}
        userId={userId}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        onQuestionChange={setCurrentQuestionIndex}
        language={language}
        onLanguageChange={setLanguage}
        languages={languages}
        isNonCoding={isNonCoding}
        isSql={isSql}
        elapsedTime={elapsedTime}
        totalDurationSeconds={totalDurationSeconds}
        isLowTime={isLowTime}
        timeExpired={timeExpired}
        currentAiLevel={currentAiLevel}
        aiLevelLabels={aiLevelLabels}
        showChat={showChat}
        onToggleChat={() => setShowChat(!showChat)}
        onResetCode={() => setShowResetConfirm(true)}
        running={running}
        runningTests={runningTests}
        onRunCode={runCode}
        onRunTests={runTests}
        testCaseCount={testCases.length}
        onSettingsChange={setEditorSettings}
        questionProgress={questionProgress}
        socketConnected={socketConnected}
      />

      {/* Main Content — Resizable Panels */}
      <ResizablePanelLayout
        storageKey="intervue-session-panels"
        defaultLeftWidth={320}
        defaultRightWidth={320}
        defaultBottomHeight={280}
        leftMin={240}
        leftMax={500}
        rightMin={240}
        rightMax={500}
        bottomMin={100}
        bottomMax={500}
        showLeft={true}
        showRight={!showChat}
        showBottom={!isNonCoding && bottomPanelOpen}
        leftPanel={
          <QuestionPanel
            question={currentQuestion}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
          />
        }
        centerPanel={
          isNonCoding ? (
            <div className="h-full p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={timeExpired}
                className="w-full h-full rounded-lg border border-editor-border bg-editor-surface px-4 py-3 text-white placeholder-gray-500 focus:border-saffron focus:outline-none resize-none font-mono text-sm"
                placeholder={isSystemDesign ? "Describe your system design here..." : "Type your answer here..."}
              />
            </div>
          ) : (
            <EditorPanel
              language={isSql ? "sql" : language}
              value={code}
              onChange={(value) => !timeExpired && setCode(value)}
              readOnly={timeExpired}
              settings={editorSettings}
              onCursorPositionChange={handleCursorPosition}
            />
          )
        }
        rightPanel={
          showChat ? undefined : (
            <AIPanel
              messages={aiMessages}
              currentAiLevel={currentAiLevel}
              aiLevelLabels={aiLevelLabels}
              onSubmit={handleAiSubmit}
              loading={aiLoading}
              disabled={currentAiLevel === 0 || timeExpired}
              disabledReason={
                timeExpired ? "Session ended"
                  : currentAiLevel === 0 ? "AI disabled for this question"
                  : undefined
              }
            />
          )
        }
        bottomPanel={
          !isNonCoding ? (
            <BottomPanel
              testCases={testCases}
              testResults={testResults}
              runOutput={runOutput}
              running={running}
              runningTests={runningTests}
              streamProgress={streamProgress}
              onAddTestCase={handleAddTestCase}
            />
          ) : undefined
        }
      />

      {/* Chat Panel (separate from AI, collapsible) */}
      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-72 z-40 border-l border-editor-border bg-editor-panel shadow-2xl">
          <div className="flex items-center justify-between border-b border-editor-border px-3 py-2">
            <span className="text-xs font-semibold text-white">Chat</span>
            <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white text-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-[calc(100%-40px)]">
            <SessionChat sessionId={sessionId} userId={userId} />
          </div>
        </div>
      )}
    </div>
  );
}
