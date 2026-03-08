"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  testCases: string | null;
  starterCode: string | null;
}

interface TestCase {
  input: string;
  expected: string;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
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

const difficultyBadge: Record<string, { bg: string; text: string }> = {
  EASY: { bg: "bg-green-500/15 border-green-500/30", text: "text-green-400" },
  MEDIUM: { bg: "bg-yellow-500/15 border-yellow-500/30", text: "text-yellow-400" },
  HARD: { bg: "bg-red-500/15 border-red-500/30", text: "text-red-400" },
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

  // Per-question code storage: { [questionIndex-lang]: code }
  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    // Initialize with session code for current question if available
    if (sessionData.code) {
      const lang = sessionData.language || "javascript";
      map[`${sessionData.currentQuestionIndex || 0}-${lang}`] = sessionData.code;
    }
    return map;
  });
  const [language, setLanguage] = useState(sessionData.language || "javascript");

  // Derive current code from codeMap or starter code
  const code = useMemo(() => {
    const key = `${currentQuestionIndex}-${language}`;
    if (codeMap[key] !== undefined) return codeMap[key];
    // Fall back to starter code for this language
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

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const [runOutput, setRunOutput] = useState<{ output: string; error: string; exitCode: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Bottom panel state
  const [bottomTab, setBottomTab] = useState<"testcases" | "results" | "console">("testcases");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);

  const aiChatRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parse test cases for current question
  const testCases = useMemo(() => parseTestCases(currentQuestion), [currentQuestion]);

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
        if (totalDurationSeconds > 0 && elapsed >= totalDurationSeconds) {
          setTimeExpired(true);
        }
      } else {
        setElapsedTime((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionData.startedAt, totalDurationSeconds]);

  // Save code on every change, debounced to 500ms
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      }).catch(() => {});
    }, 500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [sessionId, code, language]);

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

  // Run code (Console output only)
  const runCode = useCallback(async () => {
    if (running || runningTests || timeExpired) return;
    setRunning(true);
    setBottomPanelOpen(true);
    setBottomTab("console");
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

  // Run tests against test cases (JS/TS only via Web Worker)
  const runTests = useCallback(async () => {
    if (running || runningTests || timeExpired) return;
    if (testCases.length === 0) return;

    if (language !== "javascript" && language !== "typescript") {
      setBottomPanelOpen(true);
      setBottomTab("results");
      setTestResults([]);
      return;
    }

    setRunningTests(true);
    setBottomPanelOpen(true);
    setBottomTab("results");
    setTestResults(null);

    const { runJavaScriptInWorker } = await import("@/lib/code-runner");
    const results: TestResult[] = [];

    for (const tc of testCases) {
      const testCode = `${code}\nconsole.log(JSON.stringify(${tc.input}));`;
      try {
        const result = await runJavaScriptInWorker(testCode);
        const actual = result.output.trim();
        // Normalize for comparison: parse JSON if possible
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
        });
      } catch {
        results.push({
          input: tc.input,
          expected: tc.expected,
          actual: "Execution error",
          passed: false,
        });
      }
    }

    setTestResults(results);
    setRunningTests(false);
  }, [language, code, running, runningTests, timeExpired, testCases]);

  // Reset code to starter code
  const handleResetCode = useCallback(() => {
    if (!currentQuestion) return;
    const starter = getStarterCode(currentQuestion, language);
    setCode(starter || "// Start coding here...\n");
    setShowResetConfirm(false);
  }, [currentQuestion, language, setCode]);

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
  }, [runCode, runTests]);

  // Reset test results when switching questions
  useEffect(() => {
    setTestResults(null);
    setRunOutput(null);
    setActiveTestCaseIndex(0);
  }, [currentQuestionIndex]);

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const currentAiLevel = currentQuestion?.aiLevel ?? sessionData.aiLevel;
  const isNonCoding = ["BEHAVIORAL", "BUSINESS_ANALYST", "PROJECT_MANAGEMENT"].includes(
    sessionData.template.interviewType || ""
  );
  const isSql = sessionData.template.interviewType === "SQL";
  const isSystemDesign = sessionData.template.interviewType === "SYSTEM_DESIGN";

  // Determine remaining time
  const remainingSeconds = totalDurationSeconds > 0 ? Math.max(0, totalDurationSeconds - elapsedTime) : null;
  const isLowTime = remainingSeconds !== null && remainingSeconds < 300;

  // Parse constraints into bullet items
  const constraintItems = useMemo(() => {
    if (!currentQuestion?.constraints) return [];
    return currentQuestion.constraints
      .split("\n")
      .map(c => c.trim())
      .filter(c => c.length > 0);
  }, [currentQuestion]);

  // Parse examples into structured blocks
  const parsedExamples = useMemo(() => {
    if (!currentQuestion?.examples) return [];
    const raw = currentQuestion.examples;
    // Split on "Example N:" or numbered patterns
    const blocks = raw.split(/(?=Example\s*\d|Input\s*:)/i).filter(b => b.trim());
    const examples: { input?: string; output?: string; explanation?: string }[] = [];

    // Try to parse structured examples
    let current: { input?: string; output?: string; explanation?: string } = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (/^(Example\s*\d)/i.test(trimmed)) {
        if (current.input || current.output) {
          examples.push(current);
          current = {};
        }
      } else if (/^Input\s*:/i.test(trimmed)) {
        if (current.input) {
          examples.push(current);
          current = {};
        }
        current.input = trimmed.replace(/^Input\s*:\s*/i, "");
      } else if (/^Output\s*:/i.test(trimmed)) {
        current.output = trimmed.replace(/^Output\s*:\s*/i, "");
      } else if (/^Explanation\s*:/i.test(trimmed)) {
        current.explanation = trimmed.replace(/^Explanation\s*:\s*/i, "");
      } else if (current.explanation !== undefined) {
        current.explanation += " " + trimmed;
      } else if (current.output !== undefined && !current.explanation) {
        // continuation of output
      } else if (current.input !== undefined && current.output === undefined) {
        current.input += " " + trimmed;
      }
    }
    if (current.input || current.output) examples.push(current);

    // If structured parsing found nothing, return the blocks as-is
    if (examples.length === 0 && blocks.length > 0) {
      return blocks.map(b => ({ input: b.trim(), output: undefined, explanation: undefined }));
    }
    return examples;
  }, [currentQuestion]);

  // Test results summary
  const testSummary = useMemo(() => {
    if (!testResults) return null;
    const passed = testResults.filter(r => r.passed).length;
    return { passed, total: testResults.length, allPassed: passed === testResults.length };
  }, [testResults]);

  return (
    <div className="flex h-screen flex-col bg-gray-950 overflow-hidden">
      <SessionProtections sessionId={sessionId} />

      {/* Reset Code Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-2">Reset Code?</h3>
            <p className="text-sm text-gray-400 mb-5">
              This will replace your current code with the starter template. This cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
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

        <div className="flex items-center gap-3">
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

          {/* Reset Code Button */}
          {!isNonCoding && (
            <button
              onClick={() => setShowResetConfirm(true)}
              disabled={timeExpired}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
              onClick={runCode}
              disabled={running || runningTests || timeExpired}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-gray-200 hover:bg-gray-600 disabled:opacity-50 transition-colors"
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
          {!isNonCoding && testCases.length > 0 && (
            <button
              onClick={runTests}
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
                {/* Difficulty pill badge */}
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  difficultyBadge[currentQuestion.difficulty]?.bg || ""
                } ${difficultyBadge[currentQuestion.difficulty]?.text || "text-gray-400"}`}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-gray-500">{currentQuestion.timeLimit} min</span>
              </div>

              <h2 className="text-lg font-bold text-white mb-4">{currentQuestion.title}</h2>

              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <p className="whitespace-pre-wrap leading-relaxed">{currentQuestion.description}</p>
                </div>

                {/* Structured Examples */}
                {parsedExamples.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Examples</h4>
                    <div className="space-y-3">
                      {parsedExamples.map((ex, i) => (
                        <div key={i} className="rounded-lg bg-gray-800/70 border border-gray-700/50 p-3 space-y-1.5">
                          {ex.input && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase text-gray-500">Input: </span>
                              <code className="text-xs text-blue-300 font-mono">{ex.input}</code>
                            </div>
                          )}
                          {ex.output && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase text-gray-500">Output: </span>
                              <code className="text-xs text-green-300 font-mono">{ex.output}</code>
                            </div>
                          )}
                          {ex.explanation && (
                            <div>
                              <span className="text-[10px] font-semibold uppercase text-gray-500">Explanation: </span>
                              <span className="text-xs text-gray-400">{ex.explanation}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Fallback: raw examples if parsing produced nothing */}
                {parsedExamples.length === 0 && currentQuestion.examples && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Examples</h4>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                      {currentQuestion.examples}
                    </pre>
                  </div>
                )}

                {/* Constraints as bullet list */}
                {constraintItems.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Constraints</h4>
                    <ul className="space-y-1">
                      {constraintItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                          <span className="text-gray-600 mt-0.5 shrink-0">&bull;</span>
                          <code className="font-mono text-gray-300 bg-gray-800/50 px-1 rounded">{item}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No question available</p>
          )}
        </div>

        {/* Center: Code Editor / Text Area + Bottom Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isNonCoding ? (
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
              {/* Editor */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
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

              {/* Bottom Panel - 3 tabs */}
              <div className={`border-t border-gray-800 bg-gray-900 flex flex-col shrink-0 transition-all ${bottomPanelOpen ? "h-[280px]" : "h-[36px]"}`}>
                {/* Tab bar */}
                <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 shrink-0">
                  <div className="flex items-center gap-1">
                    {testCases.length > 0 && (
                      <button
                        onClick={() => { setBottomTab("testcases"); setBottomPanelOpen(true); }}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          bottomTab === "testcases" && bottomPanelOpen
                            ? "bg-gray-800 text-white"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        Test Cases
                      </button>
                    )}
                    {testCases.length > 0 && (
                      <button
                        onClick={() => { setBottomTab("results"); setBottomPanelOpen(true); }}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                          bottomTab === "results" && bottomPanelOpen
                            ? "bg-gray-800 text-white"
                            : "text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        Test Results
                        {testSummary && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                            testSummary.allPassed
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {testSummary.passed}/{testSummary.total}
                          </span>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => { setBottomTab("console"); setBottomPanelOpen(true); }}
                      className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                        bottomTab === "console" && bottomPanelOpen
                          ? "bg-gray-800 text-white"
                          : "text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      Console
                    </button>
                  </div>
                  <button
                    onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                    className="text-gray-500 hover:text-gray-300 text-xs p-1"
                    title={bottomPanelOpen ? "Collapse" : "Expand"}
                  >
                    <svg className={`w-4 h-4 transition-transform ${bottomPanelOpen ? "" : "rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Tab content */}
                {bottomPanelOpen && (
                  <div className="flex-1 overflow-auto">
                    {/* Test Cases Tab */}
                    {bottomTab === "testcases" && testCases.length > 0 && (
                      <div className="p-3">
                        {/* Case pills */}
                        <div className="flex items-center gap-1 mb-3">
                          {testCases.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveTestCaseIndex(i)}
                              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                                i === activeTestCaseIndex
                                  ? "bg-gray-700 text-white"
                                  : "bg-gray-800/50 text-gray-500 hover:text-gray-300"
                              }`}
                            >
                              Case {i + 1}
                            </button>
                          ))}
                        </div>
                        {/* Selected case detail */}
                        {testCases[activeTestCaseIndex] && (
                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Input</span>
                              <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                                {testCases[activeTestCaseIndex].input}
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                              <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                                {testCases[activeTestCaseIndex].expected}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Test Results Tab */}
                    {bottomTab === "results" && (
                      <div className="p-3">
                        {language !== "javascript" && language !== "typescript" ? (
                          <div className="flex items-center gap-2 text-xs text-gray-500 py-4 justify-center">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Test cases only available for JavaScript/TypeScript
                          </div>
                        ) : runningTests ? (
                          <div className="flex items-center gap-2 text-xs text-gray-400 py-4 justify-center">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Running tests...
                          </div>
                        ) : testResults ? (
                          <div className="space-y-2">
                            {/* Summary bar */}
                            {testSummary && (
                              <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
                                testSummary.allPassed
                                  ? "bg-green-500/10 border border-green-500/20 text-green-400"
                                  : "bg-red-500/10 border border-red-500/20 text-red-400"
                              }`}>
                                {testSummary.allPassed
                                  ? "All Passed"
                                  : `${testSummary.passed}/${testSummary.total} passed`}
                              </div>
                            )}
                            {/* Per-case results */}
                            {testResults.map((r, i) => (
                              <div key={i} className={`rounded-lg border p-3 ${
                                r.passed
                                  ? "border-green-500/20 bg-green-500/5"
                                  : "border-red-500/20 bg-red-500/5"
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  {r.passed ? (
                                    <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                      Case {i + 1} Passed
                                    </span>
                                  ) : (
                                    <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                      Case {i + 1} Failed
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Input</span>
                                    <code className="font-mono text-gray-400 text-[11px]">{r.input}</code>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Expected</span>
                                    <code className="font-mono text-gray-300 text-[11px]">{r.expected}</code>
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Actual</span>
                                    <code className={`font-mono text-[11px] ${r.passed ? "text-green-400" : "text-red-400"}`}>{r.actual || "(empty)"}</code>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500 py-4 text-center">
                            Click &quot;Run Tests&quot; to execute test cases
                          </div>
                        )}
                      </div>
                    )}

                    {/* Console Tab */}
                    {bottomTab === "console" && (
                      <div className="p-3">
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
                        ) : (
                          <div className="text-xs text-gray-500 py-4 text-center">
                            Click &quot;Run Code&quot; to see output
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
