"use client";

import { useState, useMemo } from "react";
import TestDiffView from "@/components/editor/TestDiffView";

interface TestCase {
  input: string;
  expected: string;
  custom?: boolean;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  runtime?: number;
}

interface RunOutput {
  output: string;
  error: string;
  exitCode: number;
}

interface BottomPanelProps {
  testCases: TestCase[];
  testResults: TestResult[] | null;
  runOutput: RunOutput | null;
  running: boolean;
  runningTests: boolean;
  // Streaming progress
  streamProgress?: { completed: number; total: number } | null;
  // Custom test cases
  onAddTestCase?: (tc: TestCase) => void;
}

export default function BottomPanel({
  testCases,
  testResults,
  runOutput,
  running,
  runningTests,
  streamProgress,
  onAddTestCase,
}: BottomPanelProps) {
  const [tab, setTab] = useState<"testcases" | "results" | "console">("testcases");
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInput, setNewInput] = useState("");
  const [newExpected, setNewExpected] = useState("");
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  const testSummary = useMemo(() => {
    if (!testResults) return null;
    const passed = testResults.filter(r => r.passed).length;
    return { passed, total: testResults.length, allPassed: passed === testResults.length };
  }, [testResults]);

  function handleAddTestCase() {
    if (!newInput.trim() || !newExpected.trim()) return;
    onAddTestCase?.({ input: newInput.trim(), expected: newExpected.trim(), custom: true });
    setNewInput("");
    setNewExpected("");
    setShowAddForm(false);
  }

  return (
    <div className="h-full flex flex-col border-t border-editor-border bg-editor-panel">
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-editor-border shrink-0">
        <div className="flex items-center gap-1">
          {testCases.length > 0 && (
            <button
              onClick={() => setTab("testcases")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                tab === "testcases" ? "bg-editor-surface text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Test Cases
            </button>
          )}
          {testCases.length > 0 && (
            <button
              onClick={() => setTab("results")}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                tab === "results" ? "bg-editor-surface text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Test Results
              {streamProgress && runningTests && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400">
                  {streamProgress.completed}/{streamProgress.total}
                </span>
              )}
              {testSummary && !runningTests && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  testSummary.allPassed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                }`}>
                  {testSummary.passed}/{testSummary.total}
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => setTab("console")}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              tab === "console" ? "bg-editor-surface text-white" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Console
          </button>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        {/* Test Cases Tab */}
        {tab === "testcases" && testCases.length > 0 && (
          <div className="p-3">
            <div className="flex items-center gap-1 mb-3">
              {testCases.map((tc, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestCaseIndex(i)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    i === activeTestCaseIndex
                      ? "bg-editor-hover text-white"
                      : "bg-editor-surface/50 text-gray-500 hover:text-gray-300"
                  }`}
                >
                  Case {i + 1}
                  {tc.custom && <span className="ml-1 text-[9px] text-saffron">*</span>}
                </button>
              ))}
              {onAddTestCase && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2 py-1 rounded text-xs font-medium text-gray-500 hover:text-gray-300 bg-editor-surface/50 hover:bg-editor-hover transition-colors"
                >
                  + Add
                </button>
              )}
            </div>

            {/* Add test case form */}
            {showAddForm && (
              <div className="mb-3 rounded-lg border border-editor-border bg-editor-surface p-3 space-y-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Input Expression</span>
                  <input
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    placeholder="e.g. twoSum([2,7,11,15], 9)"
                    className="w-full rounded border border-editor-border bg-editor-panel px-2 py-1.5 font-mono text-xs text-gray-300 focus:border-saffron focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                  <input
                    value={newExpected}
                    onChange={(e) => setNewExpected(e.target.value)}
                    placeholder="e.g. [0,1]"
                    className="w-full rounded border border-editor-border bg-editor-panel px-2 py-1.5 font-mono text-xs text-gray-300 focus:border-saffron focus:outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTestCase}
                    disabled={!newInput.trim() || !newExpected.trim()}
                    className="px-3 py-1 rounded bg-green-600 text-xs font-medium text-white hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {testCases[activeTestCaseIndex] && (
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Input</span>
                  <div className="rounded bg-editor-surface px-3 py-2 font-mono text-xs text-gray-300">
                    {testCases[activeTestCaseIndex].input}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-1">Expected Output</span>
                  <div className="rounded bg-editor-surface px-3 py-2 font-mono text-xs text-gray-300">
                    {testCases[activeTestCaseIndex].expected}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results Tab */}
        {tab === "results" && (
          <div className="p-3">
            {runningTests ? (
              <div className="space-y-2">
                {/* Streaming progress bar */}
                {streamProgress && (
                  <div className="rounded-lg px-3 py-2 text-xs font-medium bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    Running: {streamProgress.completed}/{streamProgress.total} tests completed
                    <div className="h-1 bg-editor-surface rounded-full mt-2">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${(streamProgress.completed / streamProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {/* Show results as they stream in */}
                {testResults && testResults.map((r, i) => (
                  <ResultCard key={i} result={r} index={i} expanded={expandedResult === i} onToggle={() => setExpandedResult(expandedResult === i ? null : i)} />
                ))}
                {/* Pending slots */}
                {streamProgress && testResults && Array.from({ length: streamProgress.total - testResults.length }).map((_, i) => (
                  <div key={`pending-${i}`} className="rounded-lg border border-editor-border bg-editor-surface/30 p-3 flex items-center gap-2">
                    <svg className="animate-spin w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-xs text-gray-500">Case {(testResults?.length || 0) + i + 1} pending...</span>
                  </div>
                ))}
              </div>
            ) : testResults ? (
              <div className="space-y-2">
                {testSummary && (
                  <div className={`rounded-lg px-3 py-2 text-xs font-medium ${
                    testSummary.allPassed
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    {testSummary.allPassed ? "All Passed" : `${testSummary.passed}/${testSummary.total} passed`}
                  </div>
                )}
                {testResults.map((r, i) => (
                  <ResultCard key={i} result={r} index={i} expanded={expandedResult === i} onToggle={() => setExpandedResult(expandedResult === i ? null : i)} />
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
        {tab === "console" && (
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
    </div>
  );
}

function ResultCard({
  result,
  index,
  expanded,
  onToggle,
}: {
  result: TestResult;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-lg border p-3 ${
      result.passed
        ? "border-green-500/20 bg-green-500/5"
        : "border-red-500/20 bg-red-500/5"
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {result.passed ? (
            <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              Case {index + 1} Passed
            </span>
          ) : (
            <span className="text-red-400 text-xs font-semibold flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Case {index + 1} Failed
            </span>
          )}
          {result.runtime !== undefined && (
            <span className="text-[10px] text-gray-500 font-mono">{result.runtime}ms</span>
          )}
        </div>
        {!result.passed && (
          <button
            onClick={onToggle}
            className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            {expanded ? "Hide diff" : "Show diff"}
          </button>
        )}
      </div>

      {/* Compact view */}
      {!expanded && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Input</span>
            <code className="font-mono text-gray-400 text-[11px]">{result.input}</code>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Expected</span>
            <code className="font-mono text-gray-300 text-[11px]">{result.expected}</code>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-gray-500 block mb-0.5">Actual</span>
            <code className={`font-mono text-[11px] ${result.passed ? "text-green-400" : "text-red-400"}`}>
              {result.actual || "(empty)"}
            </code>
          </div>
        </div>
      )}

      {/* Expanded diff view */}
      {expanded && !result.passed && (
        <div className="mt-2">
          <TestDiffView expected={result.expected} actual={result.actual} />
        </div>
      )}
    </div>
  );
}
