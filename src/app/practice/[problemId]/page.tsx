"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import Link from "next/link";
import { PROBLEM_BANK } from "@/data/problem-bank";
import { CURATED_PROBLEMS } from "@/data/curated-75";

// ─── Practice problem data ──────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expected: string;
}

interface PracticeProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  constraints: string;
  examples: string;
  starterCode: Record<string, string>;
  testCases?: TestCase[];
}

// Build curated lookup from the curated-75 data
const PRACTICE_PROBLEMS: Record<string, PracticeProblem> = {};
for (const p of CURATED_PROBLEMS) {
  PRACTICE_PROBLEMS[p.id] = p;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const languages = [
  { value: "javascript", label: "JavaScript", runnable: true },
  { value: "typescript", label: "TypeScript", runnable: true },
  { value: "python", label: "Python", runnable: true },
  { value: "java", label: "Java", runnable: true },
  { value: "cpp", label: "C++", runnable: false },
  { value: "go", label: "Go", runnable: false },
  { value: "rust", label: "Rust", runnable: false },
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

// ─── Component ──────────────────────────────────────────────────────────────────

export default function PracticeProblemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <PracticeProblemContent />
    </Suspense>
  );
}

function PracticeProblemContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const problemId = params.problemId as string;

  const curatedProblem = PRACTICE_PROBLEMS[problemId];
  const bankProblem = !curatedProblem ? PROBLEM_BANK.find((p) => p.id === problemId) : null;

  // Enrichment state for non-curated bank problems
  const [enrichedData, setEnrichedData] = useState<{
    constraints?: string;
    examples?: string;
    starterCode?: Record<string, string>;
    testCases?: { input: string; expected: string }[];
  } | null>(null);
  const [enriching, setEnriching] = useState(false);
  const enrichAttempted = useRef(false);

  // Auto-fetch enrichment for non-curated bank problems
  useEffect(() => {
    if (curatedProblem || !bankProblem || enrichAttempted.current) return;
    enrichAttempted.current = true;
    setEnriching(true);
    fetch("/api/practice/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankProblemId: bankProblem.id }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setEnrichedData({
            constraints: data.constraints,
            examples: data.examples,
            starterCode: data.starterCode,
            testCases: data.testCases,
          });
        }
      })
      .catch(() => {})
      .finally(() => setEnriching(false));
  }, [curatedProblem, bankProblem]);

  // Build unified problem object: curated → enriched bank → plain bank fallback
  const problem: PracticeProblem | null = useMemo(() => {
    if (curatedProblem) return curatedProblem;
    if (!bankProblem) return null;
    const fnName = bankProblem.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    const pyName = bankProblem.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w.toLowerCase())
      .join("_");
    const className = bankProblem.title
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
    const defaultStarter = {
      javascript: `/**\n * ${bankProblem.title}\n * ${bankProblem.description.slice(0, 80)}...\n */\nfunction ${fnName}() {\n  // Your solution here\n}\n\n// Test\nconsole.log(${fnName}());\n`,
      python: `def ${pyName}():\n    """${bankProblem.title}"""\n    # Your solution here\n    pass\n\n# Test\nprint(${pyName}())\n`,
      typescript: `function ${fnName}(): void {\n  // Your solution here\n}\n\n// Test\nconsole.log(${fnName}());\n`,
      java: `class ${className} {\n    public static void solve() {\n        // Your solution here\n    }\n\n    public static void main(String[] args) {\n        solve();\n    }\n}\n`,
    };
    return {
      id: bankProblem.id,
      title: bankProblem.title,
      difficulty: bankProblem.difficulty,
      description: bankProblem.description,
      constraints: enrichedData?.constraints || bankProblem.constraints || "",
      examples: enrichedData?.examples || bankProblem.examples || "",
      starterCode: enrichedData?.starterCode || bankProblem.starterCode || defaultStarter,
      testCases: enrichedData?.testCases || bankProblem.testCases,
    };
  }, [curatedProblem, bankProblem, enrichedData]);

  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [aiLevel, setAiLevel] = useState(2);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string; timestamp: string }[]
  >([]);
  const [executing, setExecuting] = useState(false);
  const [execOutput, setExecOutput] = useState<{
    output: string;
    error: string;
    exitCode: number;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testResults, setTestResults] = useState<{ input: string; expected: string; actual: string; passed: boolean }[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [bottomTab, setBottomTab] = useState<"testcases" | "results" | "console">("testcases");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const aiChatRef = useRef<HTMLDivElement>(null);

  // Initialize from URL params and problem starter code
  useEffect(() => {
    const levelParam = searchParams.get("aiLevel");
    if (levelParam) {
      const parsed = parseInt(levelParam, 10);
      if (parsed >= 0 && parsed <= 4) setAiLevel(parsed);
    }
  }, [searchParams]);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode[language] || "// Start coding here...\n");
    }
  }, [problem, language]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save progress every 30 seconds
  const lastSavedCode = useRef(code);
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (code !== lastSavedCode.current && code.trim()) {
        lastSavedCode.current = code;
        fetch("/api/practice/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankProblemId: problemId,
            code,
            language,
            status: "IN_PROGRESS",
            timeSpentSeconds: elapsedTime,
          }),
        }).catch(() => {}); // Silently fail for non-authenticated users
      }
    }, 30000);
    return () => clearInterval(saveInterval);
  }, [code, language, problemId, elapsedTime]);

  // Scroll AI chat to bottom
  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Run code
  const handleRunCode = useCallback(async () => {
    if (executing) return;
    setExecuting(true);
    setBottomTab("console");
    setBottomPanelOpen(true);
    setExecOutput(null);

    try {
      // For JavaScript/TypeScript, execute client-side in Web Worker
      if (language === "javascript" || language === "typescript") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setExecOutput(result);
        return;
      }

      // Check if language is runnable
      const langInfo = languages.find(l => l.value === language);
      if (!langInfo?.runnable) {
        setExecOutput({
          output: "",
          error: `${langInfo?.label || language} code execution is not available in practice mode.\n\nOnly JavaScript and TypeScript can run in the browser.\nSelect JavaScript or TypeScript to execute your code, or use the AI assistant to review your ${langInfo?.label || language} solution.`,
          exitCode: 1,
        });
        return;
      }

      // For other runnable languages, try server-side execution
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      if (data.error === "USE_CLIENT_EXECUTION") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setExecOutput(result);
      } else if (data.error && data.error.includes("No code execution service")) {
        // Friendly message for practice mode
        setExecOutput({
          output: "",
          error: `${language.charAt(0).toUpperCase() + language.slice(1)} execution requires a server-side runtime.\n\nIn practice mode, JavaScript and TypeScript run directly in your browser.\nFor other languages, switch to JavaScript/TypeScript or use the AI assistant to verify your logic.`,
          exitCode: 1,
        });
      } else {
        setExecOutput({
          output: data.output || "",
          error: data.error || "",
          exitCode: data.exitCode ?? 1,
        });
      }
    } catch {
      setExecOutput({
        output: "",
        error: "Failed to connect to execution service.",
        exitCode: 1,
      });
    } finally {
      setExecuting(false);
    }
  }, [language, code, executing]);

  // Run test cases
  const handleRunTests = useCallback(async () => {
    if (runningTests || !problem?.testCases?.length) return;
    setBottomTab("results");
    setBottomPanelOpen(true);
    if (language !== "javascript" && language !== "typescript") {
      setTestResults([{
        input: "--",
        expected: "--",
        actual: "Test cases only run with JavaScript/TypeScript in the browser.",
        passed: false,
      }]);
      return;
    }

    setRunningTests(true);
    const results: { input: string; expected: string; actual: string; passed: boolean }[] = [];

    for (const tc of problem.testCases) {
      try {
        const testCode = `${code}\nconsole.log(JSON.stringify(${tc.input}));`;
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(testCode);
        const actual = (result.output || "").trim();
        const expected = tc.expected.trim();
        const passed = actual === expected || actual === JSON.stringify(JSON.parse(expected));
        results.push({ input: tc.input, expected, actual: result.error ? `Error: ${result.error}` : actual, passed: !result.error && passed });
      } catch {
        results.push({ input: tc.input, expected: tc.expected, actual: "Execution error", passed: false });
      }
    }

    setTestResults(results);
    setRunningTests(false);
  }, [runningTests, problem, code, language]);

  // Handle AI prompt submission
  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading) return;

    if (aiLevel === 0) return;

    const userMessage = {
      role: "user" as const,
      content: aiPrompt,
      timestamp: new Date().toISOString(),
    };
    setAiMessages((prev) => [...prev, userMessage]);
    setAiPrompt("");
    setAiLoading(true);

    try {
      const res = await fetch("/api/sessions/practice-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          code,
          questionContext: problem
            ? `${problem.title}\n\n${problem.description}\n\nConstraints:\n${problem.constraints}\n\nExamples:\n${problem.examples}`
            : "",
          aiLevel,
        }),
      });

      const data = await res.json();

      const assistantMessage = {
        role: "assistant" as const,
        content: data.response || "No response generated.",
        timestamp: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage = {
        role: "assistant" as const,
        content: "Error: Failed to get AI response. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setAiMessages((prev) => [...prev, errorMessage]);
    } finally {
      setAiLoading(false);
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleRunTests();
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleRunTests]);

  const testSummary = testResults ? {
    passed: testResults.filter(t => t.passed).length,
    total: testResults.length,
    allPassed: testResults.every(t => t.passed),
  } : null;

  const visibleCount = 2;

  // 404 for unknown problem
  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-gray-400 mb-6">
            The practice problem &quot;{problemId}&quot; does not exist.
          </p>
          <Link
            href="/practice"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-950 overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900 px-4 py-2 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/practice" className="text-sm text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Practice
          </Link>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-sm font-semibold text-white">{problem.title}</span>
          <span className={`text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}{!lang.runnable ? " (editor only)" : ""}
              </option>
            ))}
          </select>
          {!languages.find(l => l.value === language)?.runnable && (
            <span className="text-[10px] text-yellow-400">Editor only</span>
          )}

          {/* AI Level Selector */}
          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(parseInt(e.target.value, 10))}
            className={`rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none ${
              aiLevelLabels[aiLevel]?.color || "text-gray-300"
            }`}
          >
            {[0, 1, 2, 3, 4].map((level) => (
              <option key={level} value={level}>
                {aiLevelLabels[level].label}
              </option>
            ))}
          </select>

          {/* Timer */}
          <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-mono text-gray-300">
              {formatTime(elapsedTime)}
            </span>
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={executing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
          >
            {executing ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            {executing ? "Running..." : "Run"}
            <span className="text-green-300 text-[10px]">Ctrl+Enter</span>
          </button>

          {/* Run Tests Button */}
          {problem?.testCases && problem.testCases.length > 0 && (
            <button
              onClick={handleRunTests}
              disabled={runningTests}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
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
              <span className="text-blue-300 text-[10px]">Ctrl+Shift+Enter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content: 3-panel layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Question */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900/50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
              {problem.difficulty}
            </span>
            <span className="rounded bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-xs text-purple-400">
              Practice
            </span>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">{problem.title}</h2>

          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
            </div>

            {enriching && (
              <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                <div className="flex items-center gap-2 text-xs text-purple-400">
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Enriching problem with test cases &amp; examples...
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Constraints
              </h4>
              {enriching && !problem.constraints ? (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-1/2" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                  {problem.constraints || "See the problem description above for constraints."}
                </pre>
              )}
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                Examples
              </h4>
              {enriching && !problem.examples ? (
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-full" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-4/5" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">
                  {problem.examples || "Try solving with sample inputs from the description."}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Center: Code Editor + Bottom Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
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
              }}
            />
          </div>

          {/* Bottom Panel - 3 tabs */}
          <div className={`border-t border-gray-800 bg-gray-900 flex flex-col shrink-0 transition-all ${bottomPanelOpen ? "h-[280px]" : "h-[36px]"}`}>
            {/* Tab bar */}
            <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-1">
                {problem?.testCases && problem.testCases.length > 0 && (
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
                {problem?.testCases && problem.testCases.length > 0 && (
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
                {bottomTab === "testcases" && problem?.testCases && problem.testCases.length > 0 && (
                  <div className="p-3">
                    {/* Case pills */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {problem.testCases.map((_, i) => {
                        const isHidden = i >= visibleCount && !testResults;
                        return (
                          <button
                            key={i}
                            onClick={() => setActiveTestCaseIndex(i)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              i === activeTestCaseIndex
                                ? "bg-gray-700 text-white"
                                : isHidden
                                ? "bg-gray-800/30 text-gray-600"
                                : "bg-gray-800/50 text-gray-500 hover:text-gray-300"
                            }`}
                          >
                            Case {i + 1}
                          </button>
                        );
                      })}
                    </div>
                    {/* Selected case detail */}
                    {problem.testCases[activeTestCaseIndex] && (
                      activeTestCaseIndex >= visibleCount && !testResults ? (
                        <div className="flex items-center gap-3 py-8 justify-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-sm">Hidden Test Case {activeTestCaseIndex + 1}</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Input</span>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                              {problem.testCases[activeTestCaseIndex].input}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                              {problem.testCases[activeTestCaseIndex].expected}
                            </div>
                          </div>
                        </div>
                      )
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
                    {executing ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Running code...
                      </div>
                    ) : execOutput ? (
                      <pre className="font-mono text-xs whitespace-pre-wrap">
                        {execOutput.output && <span className="text-gray-300">{execOutput.output}</span>}
                        {execOutput.error && <span className="text-red-400">{execOutput.error}</span>}
                        {!execOutput.output && !execOutput.error && <span className="text-gray-500">No output</span>}
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
        </div>

        {/* Right Panel: AI Sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-l border-gray-800 bg-gray-900/50">
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              <span
                className={`text-xs font-medium ${
                  aiLevelLabels[aiLevel]?.color || "text-gray-400"
                }`}
              >
                {aiLevelLabels[aiLevel]?.label}
              </span>
            </div>
            {aiLevel === 0 && (
              <p className="text-xs text-red-400 mt-1">
                AI assistance is disabled. Change the level above to enable it.
              </p>
            )}
          </div>

          {/* Chat Messages */}
          <div
            ref={aiChatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {aiMessages.length === 0 && aiLevel > 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="mt-2 text-xs text-gray-500">
                  Ask the AI for help with your solution.
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Assistance is tailored to your selected level.
                </p>
              </div>
            )}

            {aiMessages.length === 0 && aiLevel === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-10 w-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <p className="mt-2 text-xs text-gray-600">
                  AI is off. Select a higher level to get help.
                </p>
              </div>
            )}

            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                      : "bg-gray-800 text-gray-300 border border-gray-700"
                  }`}
                >
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
                disabled={aiLevel === 0}
                placeholder={
                  aiLevel === 0
                    ? "AI disabled -- change level above"
                    : "Ask the AI for help..."
                }
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={aiLevel === 0 || aiLoading || !aiPrompt.trim()}
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
