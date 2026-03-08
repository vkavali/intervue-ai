"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Editor from "@monaco-editor/react";
import Link from "next/link";

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

interface CustomProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  constraints?: string;
  examples?: string;
  tags?: string[];
  starterCode?: Record<string, string>;
}

function CustomPracticeContent() {
  const searchParams = useSearchParams();

  const [problem, setProblem] = useState<CustomProblem | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// Start coding here...\n");
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
  const [showOutput, setShowOutput] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const aiChatRef = useRef<HTMLDivElement>(null);

  // Parse problem from URL
  useEffect(() => {
    const problemParam = searchParams.get("problem");
    const levelParam = searchParams.get("aiLevel");

    if (levelParam) {
      const parsed = parseInt(levelParam, 10);
      if (parsed >= 0 && parsed <= 4) setAiLevel(parsed);
    }

    if (problemParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(problemParam));
        setProblem(parsed);
        // Set starter code if available
        if (parsed.starterCode?.[language]) {
          setCode(parsed.starterCode[language]);
        } else {
          setCode(`// ${parsed.title}\n// ${parsed.description.substring(0, 100)}...\n\n// Start coding here...\n`);
        }
      } catch {
        setProblem(null);
      }
    }
  }, [searchParams, language]);

  // Update code when language changes
  useEffect(() => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  }, [language, problem]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsedTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Scroll AI chat
  useEffect(() => {
    if (aiChatRef.current) {
      aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }
  }, [aiMessages]);

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  // Run code
  const handleRunCode = useCallback(async () => {
    if (executing) return;
    setExecuting(true);
    setShowOutput(true);
    setExecOutput(null);

    try {
      if (language === "javascript" || language === "typescript") {
        const { runJavaScriptInWorker } = await import("@/lib/code-runner");
        const result = await runJavaScriptInWorker(code);
        setExecOutput(result);
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
        setExecOutput(result);
      } else {
        setExecOutput({
          output: data.output || "",
          error: data.error || "",
          exitCode: data.exitCode ?? 1,
        });
      }
    } catch {
      setExecOutput({ output: "", error: "Failed to connect to execution service.", exitCode: 1 });
    } finally {
      setExecuting(false);
    }
  }, [language, code, executing]);

  // AI chat
  async function handleAiSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aiPrompt.trim() || aiLoading || aiLevel === 0) return;

    const userMessage = { role: "user" as const, content: aiPrompt, timestamp: new Date().toISOString() };
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
            ? `${problem.title}\n\n${problem.description}\n\n${problem.constraints ? `Constraints:\n${problem.constraints}` : ""}${problem.examples ? `\n\nExamples:\n${problem.examples}` : ""}`
            : "",
          aiLevel,
        }),
      });
      const data = await res.json();
      setAiMessages((prev) => [...prev, { role: "assistant", content: data.response || "No response.", timestamp: new Date().toISOString() }]);
    } catch {
      setAiMessages((prev) => [...prev, { role: "assistant", content: "Error: Failed to get AI response.", timestamp: new Date().toISOString() }]);
    } finally {
      setAiLoading(false);
    }
  }

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === "Enter") { e.preventDefault(); handleRunCode(); }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRunCode]);

  if (!problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">No Problem Loaded</h2>
          <p className="text-gray-400 mb-6">Generate problems from the Practice Mode page first.</p>
          <Link href="/practice" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500 transition-colors">
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
          <span className={`text-xs font-medium ${difficultyColors[problem.difficulty] || "text-gray-400"}`}>
            {problem.difficulty}
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-400">
            AI Generated
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300 focus:border-purple-500 focus:outline-none"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>

          <select
            value={aiLevel}
            onChange={(e) => setAiLevel(parseInt(e.target.value, 10))}
            className={`rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs focus:border-purple-500 focus:outline-none ${aiLevelLabels[aiLevel]?.color || "text-gray-300"}`}
          >
            {[0, 1, 2, 3, 4].map((level) => (
              <option key={level} value={level}>{aiLevelLabels[level].label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-mono text-gray-300">{formatTime(elapsedTime)}</span>
          </div>

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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Problem */}
        <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-800 bg-gray-900/50 p-5">
          <h2 className="text-lg font-bold text-white mb-4">{problem.title}</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <p className="whitespace-pre-wrap leading-relaxed">{problem.description}</p>
            {problem.constraints && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Constraints</h4>
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">{problem.constraints}</pre>
              </div>
            )}
            {problem.examples && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Examples</h4>
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-800 rounded-lg p-3 text-gray-300">{problem.examples}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Center: Editor + Output */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1">
            <Editor
              height={showOutput ? "60%" : "100%"}
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                fontSize: 14, minimap: { enabled: false }, padding: { top: 16 },
                scrollBeyondLastLine: false, smoothScrolling: true, cursorBlinking: "smooth",
                renderLineHighlight: "all", lineNumbers: "on", tabSize: 2, wordWrap: "on", automaticLayout: true,
              }}
            />
            {showOutput && (
              <div className="h-[40%] border-t border-gray-800 bg-gray-900 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400">Output</span>
                    {execOutput && (
                      <span className={`text-xs font-medium ${execOutput.exitCode === 0 ? "text-green-400" : "text-red-400"}`}>
                        {execOutput.exitCode === 0 ? "Success" : "Error"}
                      </span>
                    )}
                  </div>
                  <button onClick={() => setShowOutput(false)} className="text-gray-500 hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {executing ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="text-sm">Executing code...</span>
                    </div>
                  ) : execOutput ? (
                    <div className="space-y-2">
                      {execOutput.output && <pre className="whitespace-pre-wrap font-mono text-sm text-green-300">{execOutput.output}</pre>}
                      {execOutput.error && <pre className="whitespace-pre-wrap font-mono text-sm text-red-400">{execOutput.error}</pre>}
                      {!execOutput.output && !execOutput.error && <p className="text-sm text-gray-500">No output.</p>}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: AI */}
        <div className="w-80 shrink-0 flex flex-col border-l border-gray-800 bg-gray-900/50">
          <div className="border-b border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
              <span className={`text-xs font-medium ${aiLevelLabels[aiLevel]?.color || "text-gray-400"}`}>
                {aiLevelLabels[aiLevel]?.label}
              </span>
            </div>
            {aiLevel === 0 && <p className="text-xs text-red-400 mt-1">AI is disabled. Change the level above.</p>}
          </div>

          <div ref={aiChatRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.length === 0 && aiLevel > 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500">Ask the AI for help with your solution.</p>
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
                  <span className="block mt-1 text-[10px] text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
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

          <form onSubmit={handleAiSubmit} className="border-t border-gray-800 p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiLevel === 0}
                placeholder={aiLevel === 0 ? "AI disabled" : "Ask the AI for help..."}
                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={aiLevel === 0 || aiLoading || !aiPrompt.trim()}
                className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
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

export default function CustomPracticePage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400">Loading problem...</p>
        </div>
      </div>
    }>
      <CustomPracticeContent />
    </Suspense>
  );
}
