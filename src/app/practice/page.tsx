"use client";

import { useState } from "react";
import Link from "next/link";

const AI_LEVEL_OPTIONS = [
  { value: 0, label: "L0 No AI", description: "Solve independently", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  { value: 1, label: "L1 Hint", description: "Socratic questions only", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  { value: 2, label: "L2 Scaffold", description: "Solution skeletons", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  { value: 3, label: "L3 Guide", description: "Concept explanations", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { value: 4, label: "L4 Copilot", description: "Full AI assistance", color: "text-green-400", border: "border-green-500/30", bg: "bg-green-500/10" },
];

// Original practice problems - NOT copied from any copyrighted source
const PRACTICE_PROBLEMS = [
  {
    id: "two-sum",
    title: "Pair Finder",
    difficulty: "EASY",
    description:
      "Given a collection of numbers and a target sum, find two distinct elements whose values add up to the target. Return their positions in the collection. Assume exactly one valid answer exists.",
    tags: ["Array", "Hash Table"],
  },
  {
    id: "reverse-linked-list",
    title: "Chain Reversal",
    difficulty: "EASY",
    description:
      "You have a chain of connected nodes where each node points to the next. Reverse the direction of all connections so the last node becomes the first. Try both loop-based and recursive approaches.",
    tags: ["Linked List", "Recursion"],
  },
  {
    id: "valid-parentheses",
    title: "Bracket Validator",
    difficulty: "EASY",
    description:
      "Given a text containing only bracket characters - round (), square [], and curly {} - determine if every opening bracket has a matching closing bracket of the same type, closed in the proper nested order.",
    tags: ["Stack", "String"],
  },
  {
    id: "merge-intervals",
    title: "Time Slot Merger",
    difficulty: "MEDIUM",
    description:
      "A calendar has multiple time slots represented as [start, end] pairs. Some slots overlap. Merge all overlapping slots into non-overlapping ranges that cover the same total time.",
    tags: ["Array", "Sorting"],
  },
  {
    id: "lru-cache",
    title: "Recent Items Cache",
    difficulty: "MEDIUM",
    description:
      "Build a fixed-size storage system that keeps the most recently accessed items. When full, remove the item that hasn't been used for the longest time. Both reading and writing should be instant (O(1) time).",
    tags: ["Hash Table", "Linked List", "Design"],
  },
  {
    id: "binary-tree-level-order",
    title: "Tree Layer Scanner",
    difficulty: "MEDIUM",
    description:
      "Given a hierarchical tree structure where each node can have a left and right child, collect all node values grouped by their depth level, reading left to right within each level.",
    tags: ["Tree", "BFS", "Queue"],
  },
  {
    id: "rate-limiter",
    title: "Request Rate Limiter",
    difficulty: "MEDIUM",
    description:
      "Design a rate limiter that allows at most N requests per time window of W seconds for each unique client ID. Implement allow(clientId, timestamp) that returns true if the request should be permitted, false if it exceeds the rate limit. Handle multiple clients independently.",
    tags: ["Design", "Hash Table", "Queue"],
  },
  {
    id: "flatten-nested-data",
    title: "Nested Data Flattener",
    difficulty: "EASY",
    description:
      "Given a deeply nested data structure (arrays within arrays, to any depth), produce a single flat array containing all the values in order. For example, [1, [2, [3, 4], 5], 6] becomes [1, 2, 3, 4, 5, 6]. Do not use any built-in flatten methods.",
    tags: ["Recursion", "Array"],
  },
  {
    id: "event-emitter",
    title: "Event System",
    difficulty: "MEDIUM",
    description:
      "Implement a publish-subscribe event system with three methods: on(eventName, callback) to register a listener, off(eventName, callback) to remove a listener, and emit(eventName, ...args) to trigger all listeners for that event with the given arguments. Support multiple listeners per event.",
    tags: ["Design", "Callbacks"],
  },
  {
    id: "debounce-throttle",
    title: "Call Frequency Controller",
    difficulty: "MEDIUM",
    description:
      "Implement two utility functions: (1) debounce(fn, delay) - delays execution until no calls happen for 'delay' ms, and (2) throttle(fn, interval) - ensures fn is called at most once per 'interval' ms. Both should handle arguments correctly and return wrapper functions.",
    tags: ["Closures", "Timing"],
  },
  {
    id: "string-compressor",
    title: "Text Compressor",
    difficulty: "EASY",
    description:
      "Implement basic string compression using counts of repeated characters. For example, 'aabcccccaaa' becomes 'a2b1c5a3'. If the compressed string is not shorter than the original, return the original string. Handle edge cases like empty strings and single characters.",
    tags: ["String", "Two Pointers"],
  },
  {
    id: "task-scheduler",
    title: "Task Queue Scheduler",
    difficulty: "HARD",
    description:
      "Design a task scheduler that processes tasks with priorities and cooldown periods. Each task has a type and must wait at least N time units before the same type can run again. Given a list of tasks and cooldown N, find the minimum time units needed to execute all tasks. Idle slots can be inserted when necessary.",
    tags: ["Greedy", "Priority Queue", "Design"],
  },
];

interface GeneratedProblem {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  tags: string[];
  constraints?: string;
  examples?: string;
  starterCode?: Record<string, string>;
}

const difficultyColors: Record<string, { text: string; bg: string; border: string }> = {
  EASY: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  MEDIUM: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  HARD: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default function PracticeModePage() {
  const [selectedAiLevel, setSelectedAiLevel] = useState(2);
  const [activeTab, setActiveTab] = useState<"problems" | "generate">("problems");

  // AI Generator state
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedProblems, setGeneratedProblems] = useState<GeneratedProblem[]>([]);
  const [genError, setGenError] = useState("");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!role.trim() || generating) return;

    setGenerating(true);
    setGenError("");
    setGeneratedProblems([]);

    try {
      const res = await fetch("/api/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: company.trim(),
          role: role.trim(),
          jobDescription: jobDescription.trim(),
          difficulty: difficulty || undefined,
          count: 3,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error || "Failed to generate problems");
      } else if (data.problems) {
        setGeneratedProblems(data.problems);
      }
    } catch {
      setGenError("Failed to connect to AI service. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function renderProblemCard(problem: { id: string; title: string; difficulty: string; description: string; tags: string[] }, isGenerated: boolean = false) {
    const diff = difficultyColors[problem.difficulty] || difficultyColors.MEDIUM;
    return (
      <div
        key={problem.id}
        className="group rounded-xl border border-gray-800 bg-gray-900/50 p-5 transition-all hover:border-purple-500/30 hover:bg-gray-900"
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diff.text} ${diff.bg} ${diff.border}`}
          >
            {problem.difficulty}
          </span>
          {isGenerated && (
            <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-400">
              AI Generated
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {problem.title}
        </h3>

        <p className="text-sm text-gray-400 mb-4 line-clamp-3">
          {problem.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={
            isGenerated
              ? `/practice/custom?aiLevel=${selectedAiLevel}&problem=${encodeURIComponent(JSON.stringify(problem))}`
              : `/practice/${problem.id}?aiLevel=${selectedAiLevel}`
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Start Practice
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/candidate" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-purple-400">Practice Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-white">
            Practice Mode
          </h1>
          <p className="mt-2 text-gray-400 max-w-2xl">
            Sharpen your coding skills with curated problems or generate custom ones tailored to your target company and role.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* AI Level Selector */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-1">AI Assistance Level</h2>
          <p className="text-sm text-gray-500 mb-4">
            Select how much AI help you want during practice.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {AI_LEVEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedAiLevel(option.value)}
                className={`relative rounded-lg border p-4 text-left transition-all ${
                  selectedAiLevel === option.value
                    ? `${option.border} ${option.bg} ring-1 ring-purple-500/50`
                    : "border-gray-800 bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900"
                }`}
              >
                {selectedAiLevel === option.value && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <span className={`text-sm font-semibold ${option.color}`}>
                  {option.label}
                </span>
                <p className="mt-1 text-xs text-gray-500">
                  {option.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("problems")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "problems"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Practice Problems ({PRACTICE_PROBLEMS.length})
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "generate"
                ? "border-purple-500 text-purple-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Practice Generator
          </button>
        </div>

        {/* Problems Tab */}
        {activeTab === "problems" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRACTICE_PROBLEMS.map((problem) => renderProblemCard(problem))}
            </div>
          </div>
        )}

        {/* AI Generator Tab */}
        {activeTab === "generate" && (
          <div>
            {/* Generator Form */}
            <div className="rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-600/5 via-gray-900/50 to-blue-600/5 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Generate Company-Specific Practice</h2>
              </div>
              <p className="text-sm text-gray-400 mb-6">
                Enter a company name, role, and optionally a job description. AI will generate relevant coding problems tailored to what that company typically asks for that position.
              </p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Company Name <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Stripe, Airbnb, Spotify"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      placeholder="e.g., Senior Backend Engineer, Frontend Developer"
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Job Description / Skills to Test <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={3}
                    placeholder="Paste a job description or describe specific skills: e.g., 'Must know distributed systems, API design, and SQL optimization. Team works on payment processing infrastructure.'"
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Mixed</option>
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !role.trim()}
                    className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Problems
                      </>
                    )}
                  </button>
                </div>
              </form>

              {genError && (
                <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {genError}
                </div>
              )}
            </div>

            {/* Generated Problems */}
            {generatedProblems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  Generated Problems {company && `for ${company}`}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  These problems are AI-generated based on your criteria. Click to start practicing with the code editor.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generatedProblems.map((problem) => renderProblemCard(problem, true))}
                </div>
              </div>
            )}

            {generating && (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-400">AI is generating practice problems tailored to your specifications...</p>
                <p className="text-xs text-gray-600 mt-1">This may take 10-15 seconds</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
