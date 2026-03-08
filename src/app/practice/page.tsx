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

const PRACTICE_PROBLEMS = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "EASY",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    tags: ["Array", "Hash Table"],
  },
  {
    id: "reverse-linked-list",
    title: "Reverse Linked List",
    difficulty: "EASY",
    description:
      "Given the head of a singly linked list, reverse the list, and return the reversed list. Implement the solution iteratively and recursively.",
    tags: ["Linked List", "Recursion"],
  },
  {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "EASY",
    description:
      "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    tags: ["Stack", "String"],
  },
  {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "MEDIUM",
    description:
      "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    tags: ["Array", "Sorting"],
  },
  {
    id: "lru-cache",
    title: "LRU Cache",
    difficulty: "MEDIUM",
    description:
      "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get and put methods that both run in O(1) average time complexity.",
    tags: ["Hash Table", "Linked List", "Design"],
  },
  {
    id: "binary-tree-level-order",
    title: "Binary Tree Level Order Traversal",
    difficulty: "MEDIUM",
    description:
      "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).",
    tags: ["Tree", "BFS", "Queue"],
  },
];

const difficultyColors: Record<string, { text: string; bg: string; border: string }> = {
  EASY: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  MEDIUM: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  HARD: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default function PracticeModePage() {
  const [selectedAiLevel, setSelectedAiLevel] = useState(2);

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
            Sharpen your coding skills with curated problems. Choose your AI assistance level and start practicing at your own pace -- no interview session required.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* AI Level Selector */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-1">AI Assistance Level</h2>
          <p className="text-sm text-gray-500 mb-4">
            Select how much AI help you want during practice. You can change this before starting each problem.
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

        {/* Problems Grid */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Practice Problems</h2>
          <p className="text-sm text-gray-500 mb-4">
            Pick a problem and start coding. Your progress is not saved between sessions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRACTICE_PROBLEMS.map((problem) => {
              const diff = difficultyColors[problem.difficulty];
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
                    href={`/practice/${problem.id}?aiLevel=${selectedAiLevel}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Start Practice
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
