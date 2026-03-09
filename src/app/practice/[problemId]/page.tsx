"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Editor, { type OnMount } from "@monaco-editor/react";
import Link from "next/link";
import { PROBLEM_BANK, type ProblemEntry } from "@/data/problem-bank";
import { CURATED_PROBLEMS } from "@/data/curated-75";
import { GENERATED_PROBLEMS } from "@/data/generated-bank";

// ─── Practice problem data ──────────────────────────────────────────────────────

interface TestCase {
  input: string;
  expected: string;
  custom?: boolean;
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
  tags?: string[];
  pattern?: string;
}

// Build curated lookup from the curated-75 data
const PRACTICE_PROBLEMS: Record<string, PracticeProblem> = {};
for (const p of CURATED_PROBLEMS) {
  PRACTICE_PROBLEMS[p.id] = p;
}

// ─── Starter code generator ─────────────────────────────────────────────────────

function generateStarterCode(title: string, lang: string): string {
  const fnName = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join("");
  const pyName = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.toLowerCase())
    .join("_");
  const className = title
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("");

  switch (lang) {
    case "javascript":
      return `/**\n * ${title}\n */\nfunction ${fnName}() {\n  // Your solution here\n}\n\n// Test\nconsole.log(${fnName}());\n`;
    case "typescript":
      return `function ${fnName}(): void {\n  // Your solution here\n}\n\n// Test\nconsole.log(${fnName}());\n`;
    case "python":
      return `def ${pyName}():\n    """${title}"""\n    # Your solution here\n    pass\n\n# Test\nprint(${pyName}())\n`;
    case "java":
      return `class ${className} {\n    public static void solve() {\n        // Your solution here\n    }\n\n    public static void main(String[] args) {\n        solve();\n    }\n}\n`;
    case "cpp":
      return `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    // ${title}\n    void solve() {\n        // Your solution here\n    }\n};\n\nint main() {\n    Solution sol;\n    sol.solve();\n    return 0;\n}\n`;
    case "go":
      return `package main\n\nimport "fmt"\n\n// ${title}\nfunc ${fnName}() {\n\t// Your solution here\n}\n\nfunc main() {\n\t${fnName}()\n\tfmt.Println("done")\n}\n`;
    case "rust":
      return `// ${title}\nfn ${pyName}() {\n    // Your solution here\n}\n\nfn main() {\n    ${pyName}();\n    println!("done");\n}\n`;
    default:
      return `// ${title}\n// Your solution here\n`;
  }
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
];

// Languages that support test case judging (server-side)
const TEST_CASE_LANGS = ["javascript", "typescript", "python", "java"];

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

const SHORTCUTS = [
  { keys: "Ctrl + Enter", action: "Run Code" },
  { keys: "Ctrl + Shift + Enter", action: "Run Tests" },
  { keys: "Ctrl + S", action: "Save Progress" },
  { keys: "Ctrl + +/-", action: "Increase/Decrease Font" },
  { keys: "Ctrl + Shift + R", action: "Reset Code" },
  { keys: "Ctrl + /", action: "Toggle Comment" },
  { keys: "F1", action: "Command Palette" },
  { keys: "Ctrl + ?", action: "Show Shortcuts" },
];

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
  const bankProblem: ProblemEntry | undefined = !curatedProblem
    ? PROBLEM_BANK.find((p) => p.id === problemId) || GENERATED_PROBLEMS.find((p) => p.id === problemId)
    : undefined;

  // Check if the problem already has full data (skip AI enrichment)
  const isAlreadyComplete = !!(
    bankProblem?.starterCode &&
    bankProblem?.testCases &&
    bankProblem.testCases.length > 0 &&
    bankProblem?.constraints &&
    bankProblem?.examples
  );

  // Enrichment state for non-curated bank problems
  const [enrichedData, setEnrichedData] = useState<{
    constraints?: string;
    examples?: string;
    starterCode?: Record<string, string>;
    testCases?: { input: string; expected: string }[];
  } | null>(null);
  const [enriching, setEnriching] = useState(false);
  const enrichAttempted = useRef(false);

  // Auto-fetch enrichment ONLY for incomplete non-curated bank problems
  useEffect(() => {
    if (curatedProblem || !bankProblem || isAlreadyComplete || enrichAttempted.current) return;
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
  }, [curatedProblem, bankProblem, isAlreadyComplete]);

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
      tags: bankProblem.tags,
      pattern: bankProblem.pattern,
    };
  }, [curatedProblem, bankProblem, enrichedData]);

  // ── Core state ──────────────────────────────────────────────────────────────
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
    runtime?: number;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [testResults, setTestResults] = useState<{ input: string; expected: string; actual: string; passed: boolean; runtime?: number }[] | null>(null);
  const [runningTests, setRunningTests] = useState(false);
  const [bottomTab, setBottomTab] = useState<"testcases" | "results" | "console">("testcases");
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [capabilities, setCapabilities] = useState<Record<string, { run: boolean; testCases: boolean; backend: string | null }>>({});
  const aiChatRef = useRef<HTMLDivElement>(null);

  // ── New editor state ────────────────────────────────────────────────────────
  const [fontSize, setFontSize] = useState(14);
  const [tabSize, setTabSize] = useState(2);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [cursorInfo, setCursorInfo] = useState({ line: 1, column: 1, selected: 0 });
  const [leftPanelWidth, setLeftPanelWidth] = useState(340);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(280);
  const [problemTab, setProblemTab] = useState<"description" | "hints" | "editorial">("description");
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([]);
  const [addingCustomTC, setAddingCustomTC] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customExpected, setCustomExpected] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<"accepted" | "wrong" | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [loadingHints, setLoadingHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState(0);

  // Editorial state
  const [editorial, setEditorial] = useState<{
    intuition: string;
    bruteForce: string;
    optimized: string;
    complexity: string;
    codeWalkthrough: string;
  } | null>(null);
  const [loadingEditorial, setLoadingEditorial] = useState(false);
  const [editorialError, setEditorialError] = useState("");

  // Coaching state
  const [coaching, setCoaching] = useState<{
    overallAssessment: string;
    score: number;
    whatWentWell: string[];
    whatToImprove: string[];
    complexityAnalysis: { yourTime: string; yourSpace: string; optimalTime: string; optimalSpace: string };
    patternRecognition: string;
    followUpQuestions: string[];
  } | null>(null);
  const [loadingCoaching, setLoadingCoaching] = useState(false);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingBottom = useRef(false);
  const settingsRef = useRef<HTMLDivElement>(null);

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
      setCode(problem.starterCode[language] || generateStarterCode(problem.title, language));
    }
  }, [problem, language]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch server capabilities on mount
  useEffect(() => {
    fetch("/api/capabilities")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.languages) setCapabilities(data.languages);
      })
      .catch(() => {});
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
        }).catch(() => {});
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

  // Close settings dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    }
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSettings]);

  // ── Panel resizing ──────────────────────────────────────────────────────────
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (isDraggingLeft.current) {
        const newWidth = Math.min(Math.max(200, e.clientX), 600);
        setLeftPanelWidth(newWidth);
      }
      if (isDraggingBottom.current) {
        const container = document.getElementById("editor-container");
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = Math.min(Math.max(100, rect.bottom - e.clientY), 500);
          setBottomPanelHeight(newHeight);
        }
      }
    }
    function handleMouseUp() {
      isDraggingLeft.current = false;
      isDraggingBottom.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorPosition((e) => {
      const sel = editor.getSelection();
      let selected = 0;
      if (sel && !sel.isEmpty()) {
        selected = editor.getModel()?.getValueInRange(sel)?.length || 0;
      }
      setCursorInfo({ line: e.position.lineNumber, column: e.position.column, selected });
    });
  };

  // ── All test cases (built-in + custom) ──────────────────────────────────────
  const allTestCases = useMemo(() => {
    const builtIn = (problem?.testCases || []).map(tc => ({ ...tc, custom: false }));
    return [...builtIn, ...customTestCases.map(tc => ({ ...tc, custom: true }))];
  }, [problem?.testCases, customTestCases]);

  // ── Helpers: capability checks ──────────────────────────────────────────────
  const canRun = useCallback((lang: string) => {
    if (capabilities[lang]) return capabilities[lang].run;
    // Fallback: JS/TS always runnable (browser worker), Python/Java try server
    return ["javascript", "typescript", "python", "java"].includes(lang);
  }, [capabilities]);

  const canTestCases = useCallback((lang: string) => {
    if (capabilities[lang]) return capabilities[lang].testCases;
    return TEST_CASE_LANGS.includes(lang);
  }, [capabilities]);

  // ── Run code ────────────────────────────────────────────────────────────────
  const handleRunCode = useCallback(async () => {
    if (executing) return;
    setExecuting(true);
    setBottomTab("console");
    setBottomPanelOpen(true);
    setExecOutput(null);
    const startTime = performance.now();

    try {
      // Try server-first for ALL languages
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      });
      const data = await res.json();
      const runtime = Math.round(performance.now() - startTime);

      // Server says use client-side → JS/TS browser worker fallback
      if (data.error === "USE_CLIENT_EXECUTION" && (language === "javascript" || language === "typescript")) {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setExecOutput({ ...result, runtime });
        return;
      }

      // No backend available
      if (data.error && data.error.includes("No code execution service")) {
        const langLabel = languages.find(l => l.value === language)?.label || language;
        setExecOutput({
          output: "",
          error: `${langLabel} execution requires a server-side runtime (not configured).\n\nJavaScript and TypeScript can run in the browser.\nFor other languages, configure Piston or Judge0, or install the runtime locally.`,
          exitCode: 1,
        });
        return;
      }

      setExecOutput({
        output: data.output || "",
        error: data.error || "",
        exitCode: data.exitCode ?? 1,
        runtime,
      });
    } catch {
      // Server unreachable — fallback to browser worker for JS/TS
      if (language === "javascript" || language === "typescript") {
        try {
          const { runJavaScriptInWorker } = await import("@/lib/code-runner");
          const result = await runJavaScriptInWorker(code);
          const runtime = Math.round(performance.now() - startTime);
          setExecOutput({ ...result, runtime });
          return;
        } catch { /* fall through */ }
      }
      setExecOutput({
        output: "",
        error: "Failed to connect to execution service.",
        exitCode: 1,
      });
    } finally {
      setExecuting(false);
    }
  }, [language, code, executing]);

  // ── Run test cases ──────────────────────────────────────────────────────────
  const runTestsInternal = useCallback(async (cases: TestCase[]): Promise<{ input: string; expected: string; actual: string; passed: boolean; runtime?: number }[]> => {
    // Check if language supports test cases
    if (!canTestCases(language)) {
      const langLabel = languages.find(l => l.value === language)?.label || language;
      return [{
        input: "--",
        expected: "--",
        actual: `Test cases for ${langLabel} are not yet supported.\nTest cases are available for JavaScript, TypeScript, Python, and Java.`,
        passed: false,
      }];
    }

    // Try server-side test runner first
    try {
      const res = await fetch("/api/execute/run-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, testCases: cases.map(tc => ({ input: tc.input, expected: tc.expected })) }),
      });
      const data = await res.json();

      if (res.ok && data.results) {
        return data.results;
      }
      // Server returned an error — fall through to browser fallback for JS/TS
    } catch {
      // Server unreachable — fall through to browser fallback for JS/TS
    }

    // Browser fallback: JS/TS only
    if (language === "javascript" || language === "typescript") {
      const results: { input: string; expected: string; actual: string; passed: boolean; runtime?: number }[] = [];
      for (const tc of cases) {
        try {
          const testCode = `${code}\nconsole.log(JSON.stringify(${tc.input}));`;
          const { runJavaScriptInWorker } = await import("@/lib/code-runner");
          const start = performance.now();
          const result = await runJavaScriptInWorker(testCode);
          const runtime = Math.round(performance.now() - start);
          const actual = (result.output || "").trim();
          const expected = tc.expected.trim();
          let passed = false;
          try {
            passed = actual === expected || actual === JSON.stringify(JSON.parse(expected));
          } catch {
            passed = actual === expected;
          }
          results.push({ input: tc.input, expected, actual: result.error ? `Error: ${result.error}` : actual, passed: !result.error && passed, runtime });
        } catch {
          results.push({ input: tc.input, expected: tc.expected, actual: "Execution error", passed: false });
        }
      }
      return results;
    }

    return [{
      input: "--",
      expected: "--",
      actual: "Server-side execution is unavailable. Please try again later.",
      passed: false,
    }];
  }, [code, language, canTestCases]);

  const handleRunTests = useCallback(async () => {
    if (runningTests || allTestCases.length === 0) return;
    setBottomTab("results");
    setBottomPanelOpen(true);
    setRunningTests(true);
    const results = await runTestsInternal(allTestCases);
    setTestResults(results);
    setRunningTests(false);
  }, [runningTests, allTestCases, runTestsInternal]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (submitting || allTestCases.length === 0) return;
    setSubmitting(true);
    setSubmitResult(null);
    setBottomTab("results");
    setBottomPanelOpen(true);

    const results = await runTestsInternal(allTestCases);
    setTestResults(results);
    const allPassed = results.every(r => r.passed);
    setSubmitResult(allPassed ? "accepted" : "wrong");

    // Save progress
    fetch("/api/practice/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankProblemId: problemId,
        code,
        language,
        status: allPassed ? "COMPLETED" : "IN_PROGRESS",
        timeSpentSeconds: elapsedTime,
      }),
    }).catch(() => {});

    setSubmitting(false);
    // Clear submit result after 5 seconds
    setTimeout(() => setSubmitResult(null), 5000);
  }, [submitting, allTestCases, runTestsInternal, problemId, code, language, elapsedTime]);

  // ── Reset code ──────────────────────────────────────────────────────────────
  const handleResetCode = useCallback(() => {
    if (problem) {
      setCode(problem.starterCode[language] || generateStarterCode(problem.title, language));
    }
  }, [problem, language]);

  // ── Fetch hints (structured API) ─────────────────────────────────────────────
  const fetchHints = useCallback(async () => {
    if (loadingHints || hints.length > 0 || !problem) return;

    // Use static hints from bankProblem if available (no API call needed)
    if (bankProblem?.hints && bankProblem.hints.length >= 3) {
      setHints(bankProblem.hints.slice(0, 3));
      return;
    }

    setLoadingHints(true);
    try {
      const res = await fetch("/api/practice/hints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankProblemId: problemId }),
      });
      const data = await res.json();
      if (data.hints) {
        const h = data.hints;
        setHints([h.pattern, h.dataStructure, h.approach]);
      } else {
        setHints(["No hints available."]);
      }
    } catch {
      setHints(["Failed to load hints. Try again later."]);
    } finally {
      setLoadingHints(false);
    }
  }, [loadingHints, hints.length, problem, problemId, bankProblem]);

  // ── Fetch editorial ────────────────────────────────────────────────────────
  const fetchEditorial = useCallback(async () => {
    if (loadingEditorial || editorial || !problem) return;
    setLoadingEditorial(true);
    setEditorialError("");
    try {
      const res = await fetch("/api/practice/editorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankProblemId: problemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEditorialError(data.error || "Failed to load editorial");
      } else {
        setEditorial(data.editorial);
      }
    } catch {
      setEditorialError("Failed to load editorial. Try again later.");
    } finally {
      setLoadingEditorial(false);
    }
  }, [loadingEditorial, editorial, problem, problemId]);

  // ── Fetch coaching ─────────────────────────────────────────────────────────
  const fetchCoaching = useCallback(async () => {
    if (loadingCoaching || !problem) return;
    setLoadingCoaching(true);
    try {
      const res = await fetch("/api/practice/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankProblemId: problemId,
          code,
          language,
          timeSpentSeconds: elapsedTime,
          testsPassed: testResults?.filter(t => t.passed).length || 0,
          testsTotal: testResults?.length || 0,
        }),
      });
      const data = await res.json();
      if (data.feedback) setCoaching(data.feedback);
    } catch {
      // silently fail
    } finally {
      setLoadingCoaching(false);
    }
  }, [loadingCoaching, problem, problemId, code, language, elapsedTime, testResults]);

  // ── Handle AI prompt ────────────────────────────────────────────────────────
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

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
        e.preventDefault();
        handleRunTests();
      } else if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      } else if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        // Save now
        if (code.trim()) {
          lastSavedCode.current = code;
          fetch("/api/practice/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bankProblemId: problemId, code, language, status: "IN_PROGRESS", timeSpentSeconds: elapsedTime }),
          }).catch(() => {});
        }
      } else if (e.ctrlKey && e.shiftKey && (e.key === "R" || e.key === "r")) {
        e.preventDefault();
        handleResetCode();
      } else if (e.ctrlKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setFontSize(prev => Math.min(prev + 2, 24));
      } else if (e.ctrlKey && e.key === "-") {
        e.preventDefault();
        setFontSize(prev => Math.max(prev - 2, 10));
      } else if (e.ctrlKey && e.key === "?") {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode, handleRunTests, handleResetCode, code, language, problemId, elapsedTime]);

  // ── Derived values ──────────────────────────────────────────────────────────
  const testSummary = testResults ? {
    passed: testResults.filter(t => t.passed).length,
    total: testResults.length,
    allPassed: testResults.every(t => t.passed),
    avgRuntime: Math.round(testResults.reduce((sum, t) => sum + (t.runtime || 0), 0) / testResults.length),
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
      {/* ─── Submit Result Banner ──────────────────────────────────────────── */}
      {submitResult && (
        <div className={`px-4 py-2 text-center text-sm font-bold shrink-0 animate-pulse ${
          submitResult === "accepted"
            ? "bg-green-500/20 text-green-400 border-b border-green-500/30"
            : "bg-red-500/20 text-red-400 border-b border-red-500/30"
        }`}>
          {submitResult === "accepted" ? "Accepted - All test cases passed!" : "Wrong Answer - Some test cases failed"}
        </div>
      )}

      {/* ─── Top Bar ──────────────────────────────────────────────────────── */}
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

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}{canRun(lang.value) ? (canTestCases(lang.value) ? "" : " (run only)") : " (editor only)"}
              </option>
            ))}
          </select>

          {/* AI Level */}
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
          <div className="flex items-center gap-1.5 rounded bg-gray-800 px-2 py-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-mono text-gray-300">{formatTime(elapsedTime)}</span>
          </div>

          {/* Font Size */}
          <div className="flex items-center rounded bg-gray-800 overflow-hidden">
            <button onClick={() => setFontSize(prev => Math.max(prev - 2, 10))} className="px-1.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Decrease font">
              A-
            </button>
            <span className="px-1 py-1 text-[10px] text-gray-500 border-x border-gray-700">{fontSize}</span>
            <button onClick={() => setFontSize(prev => Math.min(prev + 2, 24))} className="px-1.5 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="Increase font">
              A+
            </button>
          </div>

          {/* Settings Dropdown */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="rounded bg-gray-800 p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Editor settings"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {showSettings && (
              <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-gray-700 bg-gray-800 shadow-xl z-50 py-2">
                <div className="px-3 py-1.5">
                  <label className="text-[10px] uppercase text-gray-500 font-semibold">Tab Size</label>
                  <div className="flex gap-1 mt-1">
                    {[2, 4].map(s => (
                      <button key={s} onClick={() => setTabSize(s)} className={`px-2 py-0.5 rounded text-xs ${tabSize === s ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400 hover:text-white"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-3 py-1.5">
                  <label className="text-[10px] uppercase text-gray-500 font-semibold">Word Wrap</label>
                  <div className="flex gap-1 mt-1">
                    {(["on", "off"] as const).map(w => (
                      <button key={w} onClick={() => setWordWrap(w)} className={`px-2 py-0.5 rounded text-xs capitalize ${wordWrap === w ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-400 hover:text-white"}`}>
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-700 mt-2 pt-2 px-3 py-1">
                  <button onClick={() => { setShowShortcuts(true); setShowSettings(false); }} className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 w-full">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Keyboard Shortcuts
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            className="rounded bg-gray-800 p-1.5 text-gray-400 hover:text-yellow-400 hover:bg-gray-700 transition-colors"
            title="Reset code (Ctrl+Shift+R)"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-700" />

          {/* Run Button */}
          <button
            onClick={handleRunCode}
            disabled={executing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-600 disabled:opacity-50 transition-colors"
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
          </button>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || allTestCases.length === 0 || !canTestCases(language)}
            title={!canTestCases(language) ? "Test cases available for JS, TS, Python, Java" : ""}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50 ${
              submitResult === "accepted"
                ? "bg-green-600 hover:bg-green-500"
                : submitResult === "wrong"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-green-600 hover:bg-green-500"
            }`}
          >
            {submitting ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {submitting ? "Submitting..." : submitResult === "accepted" ? "Accepted" : submitResult === "wrong" ? "Wrong Answer" : "Submit"}
          </button>
        </div>
      </div>

      {/* ─── Main Content: 3-panel layout ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Problem Description */}
        <div
          className="shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900/50 flex flex-col"
          style={{ width: leftPanelWidth }}
        >
          {/* Problem tabs */}
          <div className="flex border-b border-gray-800 px-4 pt-2 shrink-0">
            <button
              onClick={() => setProblemTab("description")}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                problemTab === "description" ? "bg-gray-800 text-white border-b-2 border-purple-500" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => { setProblemTab("hints"); if (hints.length === 0) fetchHints(); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                problemTab === "hints" ? "bg-gray-800 text-white border-b-2 border-yellow-500" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Hints
            </button>
            <button
              onClick={() => { setProblemTab("editorial"); if (!editorial && !editorialError) fetchEditorial(); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                problemTab === "editorial" ? "bg-gray-800 text-white border-b-2 border-green-500" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Editorial
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {problemTab === "description" && (
              <>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className={`text-xs font-medium ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                  <span className="rounded bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-xs text-purple-400">
                    Practice
                  </span>
                  {problem.pattern && (
                    <span className="rounded bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-xs text-blue-400">
                      {problem.pattern}
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-white mb-3">{problem.title}</h2>

                {/* Tags */}
                {problem.tags && problem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {problem.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-800 border border-gray-700 px-2 py-0.5 text-[10px] text-gray-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

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
              </>
            )}

            {problemTab === "hints" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Progressive Hints
                </h3>
                <p className="text-xs text-gray-500">Hints go from vague to specific. Reveal only what you need.</p>

                {loadingHints ? (
                  <div className="flex items-center gap-2 text-xs text-purple-400 py-4">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating hints...
                  </div>
                ) : hints.length > 0 ? (
                  <div className="space-y-2">
                    {hints.map((hint, i) => {
                      const hintLabels = ["Pattern", "Data Structure", "Approach"];
                      return (
                        <div key={i}>
                          {i < hintsRevealed ? (
                            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[10px] font-bold text-yellow-500">{hintLabels[i] || `HINT ${i + 1}`}</span>
                              </div>
                              <p className="text-sm text-gray-300">{hint}</p>
                            </div>
                          ) : i === hintsRevealed ? (
                            <button
                              onClick={() => setHintsRevealed(prev => prev + 1)}
                              className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-xs text-gray-400 hover:text-yellow-400 hover:border-yellow-500/30 transition-colors flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Reveal {hintLabels[i] || `Hint ${i + 1}`}
                            </button>
                          ) : (
                            <div className="rounded-lg border border-gray-800 bg-gray-900 p-3 text-xs text-gray-600 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              {hintLabels[i] || `Hint ${i + 1}`} - Reveal previous hint first
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <button onClick={fetchHints} className="text-xs text-purple-400 hover:text-purple-300 underline">
                    Load hints
                  </button>
                )}
              </div>
            )}

            {problemTab === "editorial" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Editorial
                </h3>

                {loadingEditorial ? (
                  <div className="flex items-center gap-2 text-xs text-green-400 py-4">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating editorial...
                  </div>
                ) : editorialError ? (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
                    <p className="text-sm text-yellow-400">{editorialError}</p>
                    <button
                      onClick={() => { setEditorialError(""); fetchEditorial(); }}
                      className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : editorial ? (
                  <div className="space-y-3">
                    {[
                      { title: "Intuition", content: editorial.intuition, color: "border-green-500/20 bg-green-500/5" },
                      { title: "Brute Force", content: editorial.bruteForce, color: "border-orange-500/20 bg-orange-500/5" },
                      { title: "Optimized Solution", content: editorial.optimized, color: "border-blue-500/20 bg-blue-500/5" },
                      { title: "Complexity", content: editorial.complexity, color: "border-purple-500/20 bg-purple-500/5" },
                      { title: "Code Walkthrough", content: editorial.codeWalkthrough, color: "border-cyan-500/20 bg-cyan-500/5" },
                    ].map((section) => (
                      <div key={section.title} className={`rounded-lg border ${section.color} p-3`}>
                        <h4 className="text-xs font-bold uppercase text-gray-400 mb-1.5">{section.title}</h4>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{section.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <svg className="mx-auto h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs text-gray-500">Submit a solution or spend 20+ minutes to unlock the editorial.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Left Panel Resize Handle */}
        <div
          className="w-1 cursor-col-resize bg-gray-800 hover:bg-purple-500/50 active:bg-purple-500 transition-colors shrink-0"
          onMouseDown={(e) => {
            e.preventDefault();
            isDraggingLeft.current = true;
            document.body.style.cursor = "col-resize";
            document.body.style.userSelect = "none";
          }}
        />

        {/* Center: Code Editor + Bottom Panel */}
        <div className="flex-1 flex flex-col overflow-hidden" id="editor-container">
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              onMount={handleEditorMount}
              options={{
                fontSize,
                fontFamily: "var(--font-geist-mono), monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                lineNumbers: "on",
                tabSize,
                wordWrap,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Bottom Panel Resize Handle */}
          {bottomPanelOpen && (
            <div
              className="h-1 cursor-row-resize bg-gray-800 hover:bg-purple-500/50 active:bg-purple-500 transition-colors shrink-0"
              onMouseDown={(e) => {
                e.preventDefault();
                isDraggingBottom.current = true;
                document.body.style.cursor = "row-resize";
                document.body.style.userSelect = "none";
              }}
            />
          )}

          {/* Bottom Panel - 3 tabs */}
          <div className={`border-t border-gray-800 bg-gray-900 flex flex-col shrink-0 transition-all ${bottomPanelOpen ? "" : "h-[36px]"}`} style={bottomPanelOpen ? { height: bottomPanelHeight } : undefined}>
            {/* Tab bar */}
            <div className="flex items-center justify-between px-3 py-1 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-1">
                {allTestCases.length > 0 && (
                  <button
                    onClick={() => { setBottomTab("testcases"); setBottomPanelOpen(true); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      bottomTab === "testcases" && bottomPanelOpen
                        ? "bg-gray-800 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}
                  >
                    Test Cases
                    <span className="ml-1 text-[10px] text-gray-600">{allTestCases.length}</span>
                  </button>
                )}
                {allTestCases.length > 0 && (
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
                {bottomTab === "testcases" && allTestCases.length > 0 && (
                  <div className="p-3">
                    {/* Case pills */}
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {allTestCases.map((tc, i) => {
                        const isHidden = !tc.custom && i >= visibleCount && !testResults;
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
                            {tc.custom ? `Custom ${i - (problem?.testCases?.length || 0) + 1}` : `Case ${i + 1}`}
                          </button>
                        );
                      })}
                      {/* Add custom test case button */}
                      <button
                        onClick={() => setAddingCustomTC(true)}
                        className="px-2 py-1 rounded text-xs text-gray-600 hover:text-green-400 hover:bg-gray-800 transition-colors"
                        title="Add custom test case"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Add custom test case form */}
                    {addingCustomTC && (
                      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-3 mb-3 space-y-2">
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Input Expression</span>
                          <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. twoSum([2,7,11], 9)"
                            className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1.5 text-xs font-mono text-gray-300 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                          <input
                            type="text"
                            value={customExpected}
                            onChange={(e) => setCustomExpected(e.target.value)}
                            placeholder='e.g. [0,1]'
                            className="w-full rounded bg-gray-900 border border-gray-700 px-2 py-1.5 text-xs font-mono text-gray-300 focus:border-purple-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => { setAddingCustomTC(false); setCustomInput(""); setCustomExpected(""); }}
                            className="px-2 py-1 rounded text-xs text-gray-500 hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              if (customInput.trim() && customExpected.trim()) {
                                setCustomTestCases(prev => [...prev, { input: customInput.trim(), expected: customExpected.trim(), custom: true }]);
                                setCustomInput("");
                                setCustomExpected("");
                                setAddingCustomTC(false);
                              }
                            }}
                            className="px-3 py-1 rounded text-xs bg-green-600 text-white hover:bg-green-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Selected case detail */}
                    {allTestCases[activeTestCaseIndex] && (
                      !allTestCases[activeTestCaseIndex].custom && activeTestCaseIndex >= visibleCount && !testResults ? (
                        <div className="flex items-center gap-3 py-8 justify-center text-gray-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="text-sm">Hidden Test Case {activeTestCaseIndex + 1} - Run tests to reveal</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase text-gray-500">Input</span>
                            {allTestCases[activeTestCaseIndex].custom && (
                              <button
                                onClick={() => {
                                  const customIdx = activeTestCaseIndex - (problem?.testCases?.length || 0);
                                  setCustomTestCases(prev => prev.filter((_, i) => i !== customIdx));
                                  setActiveTestCaseIndex(0);
                                }}
                                className="text-[10px] text-red-400 hover:text-red-300"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                            {allTestCases[activeTestCaseIndex].input}
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                            <div className="rounded bg-gray-800 px-3 py-2 font-mono text-xs text-gray-300">
                              {allTestCases[activeTestCaseIndex].expected}
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
                    {!canTestCases(language) ? (
                      <div className="flex flex-col items-center gap-2 text-xs text-gray-500 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Test cases available for JavaScript, TypeScript, Python, Java
                        </div>
                        {canRun(language) && (
                          <span className="text-[10px] text-gray-600">Use &quot;Run&quot; to execute your code without test case judging</span>
                        )}
                      </div>
                    ) : runningTests || submitting ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-4 justify-center">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {submitting ? "Submitting..." : "Running tests..."}
                      </div>
                    ) : testResults ? (
                      <div className="space-y-2">
                        {/* Summary bar */}
                        {testSummary && (
                          <div className={`rounded-lg px-3 py-2 text-xs font-medium flex items-center justify-between ${
                            testSummary.allPassed
                              ? "bg-green-500/10 border border-green-500/20 text-green-400"
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                          }`}>
                            <span>
                              {testSummary.allPassed
                                ? "All Passed"
                                : `${testSummary.passed}/${testSummary.total} passed`}
                            </span>
                            {testSummary.avgRuntime > 0 && (
                              <span className="text-gray-500">avg {testSummary.avgRuntime}ms</span>
                            )}
                          </div>
                        )}
                        {/* Per-case results */}
                        {testResults.map((r, i) => (
                          <div key={i} className={`rounded-lg border p-3 ${
                            r.passed
                              ? "border-green-500/20 bg-green-500/5"
                              : "border-red-500/20 bg-red-500/5"
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
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
                              {r.runtime !== undefined && (
                                <span className="text-[10px] text-gray-500">{r.runtime}ms</span>
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
                        Click &quot;Run Tests&quot; or &quot;Submit&quot; to execute test cases
                      </div>
                    )}
                  </div>
                )}

                {/* Coaching section in results tab */}
                {bottomTab === "results" && testResults && (
                  <div className="px-3 pb-3">
                    {!coaching && !loadingCoaching && (
                      <button
                        onClick={fetchCoaching}
                        className="w-full mt-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Get AI Coaching
                      </button>
                    )}
                    {loadingCoaching && (
                      <div className="flex items-center justify-center gap-2 text-xs text-purple-400 py-3">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Analyzing your solution...
                      </div>
                    )}
                    {coaching && (
                      <div className="mt-3 space-y-3">
                        <div className="rounded-lg border border-purple-500/20 bg-purple-500/5 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold uppercase text-purple-400">AI Coach</h4>
                            <span className={`text-sm font-bold ${coaching.score >= 80 ? "text-green-400" : coaching.score >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                              {coaching.score}/100
                            </span>
                          </div>
                          <p className="text-sm text-gray-300">{coaching.overallAssessment}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-2.5">
                            <h5 className="text-[10px] font-bold uppercase text-green-500 mb-1">What went well</h5>
                            <ul className="space-y-1">
                              {coaching.whatWentWell.map((item, i) => (
                                <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                                  <span className="text-green-400 mt-0.5 shrink-0">+</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-lg border border-orange-500/20 bg-orange-500/5 p-2.5">
                            <h5 className="text-[10px] font-bold uppercase text-orange-500 mb-1">To improve</h5>
                            <ul className="space-y-1">
                              {coaching.whatToImprove.map((item, i) => (
                                <li key={i} className="text-xs text-gray-300 flex items-start gap-1">
                                  <span className="text-orange-400 mt-0.5 shrink-0">-</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-2.5">
                          <h5 className="text-[10px] font-bold uppercase text-gray-500 mb-1.5">Complexity</h5>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div className="text-gray-400">Your Time: <span className="text-gray-300">{coaching.complexityAnalysis.yourTime}</span></div>
                            <div className="text-gray-400">Optimal: <span className="text-green-400">{coaching.complexityAnalysis.optimalTime}</span></div>
                            <div className="text-gray-400">Your Space: <span className="text-gray-300">{coaching.complexityAnalysis.yourSpace}</span></div>
                            <div className="text-gray-400">Optimal: <span className="text-green-400">{coaching.complexityAnalysis.optimalSpace}</span></div>
                          </div>
                        </div>

                        {coaching.followUpQuestions.length > 0 && (
                          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-2.5">
                            <h5 className="text-[10px] font-bold uppercase text-blue-500 mb-1">Follow-up Questions</h5>
                            <ul className="space-y-1">
                              {coaching.followUpQuestions.map((q, i) => (
                                <li key={i} className="text-xs text-gray-300">{i + 1}. {q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
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
                      <div>
                        {execOutput.runtime !== undefined && (
                          <div className="text-[10px] text-gray-500 mb-2 flex items-center gap-2">
                            <span>Runtime: {execOutput.runtime}ms</span>
                            <span>Exit code: {execOutput.exitCode}</span>
                          </div>
                        )}
                        <pre className="font-mono text-xs whitespace-pre-wrap">
                          {execOutput.output && <span className="text-gray-300">{execOutput.output}</span>}
                          {execOutput.error && <span className="text-red-400">{execOutput.error}</span>}
                          {!execOutput.output && !execOutput.error && <span className="text-gray-500">No output</span>}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 py-4 text-center">
                        Click &quot;Run&quot; to see output
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-3 py-0.5 border-t border-gray-800 bg-gray-900/80 text-[10px] text-gray-500 shrink-0">
            <div className="flex items-center gap-3">
              <span>Ln {cursorInfo.line}, Col {cursorInfo.column}</span>
              {cursorInfo.selected > 0 && <span>{cursorInfo.selected} selected</span>}
            </div>
            <div className="flex items-center gap-3">
              <span>{languages.find(l => l.value === language)?.label}</span>
              <span>UTF-8</span>
              <span>Spaces: {tabSize}</span>
            </div>
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

      {/* ─── Keyboard Shortcuts Modal ─────────────────────────────────────── */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShowShortcuts(false)} className="text-gray-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-3">
              {SHORTCUTS.map((s) => (
                <div key={s.keys} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{s.action}</span>
                  <kbd className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-xs text-gray-400 font-mono">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
