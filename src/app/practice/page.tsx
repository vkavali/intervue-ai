"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PROBLEM_BANK } from "@/data/problem-bank";

const ITEMS_PER_PAGE = 24;

const COMPANY_FILTERS = ["All", "Google", "Amazon", "Meta", "Apple", "Netflix", "General"];
const DIFFICULTY_FILTERS = ["All", "EASY", "MEDIUM", "HARD"];
const CATEGORY_FILTERS = ["All", "Arrays", "Strings", "LinkedLists", "Trees", "Graph", "DynamicProgramming", "Sorting", "StackQueue", "Design", "Math", "Greedy", "Backtracking", "SlidingWindow", "Recursion"];

const AI_LEVEL_OPTIONS = [
  { value: 0, label: "L0 No AI", description: "Solve independently", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
  { value: 1, label: "L1 Hint", description: "Socratic questions only", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  { value: 2, label: "L2 Scaffold", description: "Solution skeletons", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  { value: 3, label: "L3 Guide", description: "Concept explanations", color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { value: 4, label: "L4 Copilot", description: "Full AI assistance", color: "text-green-400", border: "border-green-500/30", bg: "bg-green-500/10" },
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

interface SavedProblem extends GeneratedProblem {
  company?: string | null;
  role?: string | null;
  createdAt: string;
  progress: {
    status: string;
    timeSpentSeconds: number;
    lastSavedAt: string;
    language: string;
  } | null;
}

const difficultyColors: Record<string, { text: string; bg: string; border: string }> = {
  EASY: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  MEDIUM: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  HARD: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
};

export default function PracticeModePage() {
  const [selectedAiLevel, setSelectedAiLevel] = useState(2);
  const [activeTab, setActiveTab] = useState<"problems" | "generate">("problems");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return PROBLEM_BANK.filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      if (companyFilter !== "All") {
        if (companyFilter === "General") { if (p.company) return false; }
        else { if (p.company !== companyFilter) return false; }
      }
      if (difficultyFilter !== "All" && p.difficulty !== difficultyFilter) return false;
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      return true;
    });
  }, [searchQuery, companyFilter, difficultyFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  const updateFilter = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // Saved problems from DB
  const [savedProblems, setSavedProblems] = useState<SavedProblem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  useEffect(() => {
    fetch("/api/practice/saved")
      .then((res) => (res.ok ? res.json() : { problems: [] }))
      .then((data) => setSavedProblems(data.problems || []))
      .catch(() => {})
      .finally(() => setLoadingSaved(false));
  }, []);

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
        // Refresh saved problems from DB (they were persisted server-side)
        fetch("/api/practice/saved")
          .then((r) => (r.ok ? r.json() : { problems: [] }))
          .then((d) => setSavedProblems(d.problems || []))
          .catch(() => {});
      }
    } catch {
      setGenError("Failed to connect to AI service. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function renderProblemCard(problem: { id: string; title: string; difficulty: string; description: string; tags: string[]; company?: string | null }, options: { isGenerated?: boolean; isSaved?: boolean; dbId?: string; progress?: SavedProblem["progress"] } = {}) {
    const { isGenerated = false, isSaved = false, dbId, progress } = options;
    const diff = difficultyColors[problem.difficulty] || difficultyColors.MEDIUM;
    // Saved problems link via DB id; freshly-generated (not yet in savedProblems) fall back to JSON URL
    // Bank problems route to /practice/{id}
    let href: string;
    if (isSaved && dbId) {
      href = `/practice/custom?id=${dbId}&aiLevel=${selectedAiLevel}`;
    } else if (isGenerated) {
      href = `/practice/custom?aiLevel=${selectedAiLevel}&problem=${encodeURIComponent(JSON.stringify(problem))}`;
    } else {
      href = `/practice/${problem.id}?aiLevel=${selectedAiLevel}`;
    }

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
          <div className="flex gap-1">
            {problem.company && (
              <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-[10px] text-blue-400">
                {problem.company}
              </span>
            )}
            {(isGenerated || isSaved) && (
              <span className="inline-flex items-center rounded-full bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 text-[10px] text-purple-400">
                AI Generated
              </span>
            )}
            {progress && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                progress.status === "COMPLETED"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
              }`}>
                {progress.status === "COMPLETED" ? "Completed" : "In Progress"}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
          {problem.title}
        </h3>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {problem.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {problem.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={href}
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
            Practice Problems ({PROBLEM_BANK.length})
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
            {/* Search and Filters */}
            <div className="mb-6 space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter(setSearchQuery, e.target.value)}
                placeholder="Search problems by title, description, or tag..."
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex flex-wrap gap-2">
                <select value={companyFilter} onChange={(e) => updateFilter(setCompanyFilter, e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
                  {COMPANY_FILTERS.map(c => <option key={c} value={c}>{c === "All" ? "All Companies" : c}</option>)}
                </select>
                <select value={difficultyFilter} onChange={(e) => updateFilter(setDifficultyFilter, e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
                  {DIFFICULTY_FILTERS.map(d => <option key={d} value={d}>{d === "All" ? "All Difficulties" : d}</option>)}
                </select>
                <select value={categoryFilter} onChange={(e) => updateFilter(setCategoryFilter, e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white focus:border-purple-500 focus:outline-none">
                  {CATEGORY_FILTERS.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                </select>
                <span className="flex items-center text-xs text-gray-500 ml-auto">
                  {filteredProblems.length} problems found
                </span>
              </div>
            </div>

            {/* Problem Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedProblems.map((problem) => renderProblemCard(problem, {}))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-30">Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`rounded-lg px-3 py-1.5 text-sm ${currentPage === page ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>{page}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-30">Next</button>
              </div>
            )}
          </div>
        )}

        {/* AI Generator Tab */}
        {activeTab === "generate" && (
          <div>
            {/* Saved Practice Problems */}
            {loadingSaved ? (
              <div className="text-center py-8 mb-8">
                <svg className="animate-spin h-6 w-6 text-purple-500 mx-auto mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-500">Loading saved problems...</p>
              </div>
            ) : savedProblems.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-1">Your Practice Problems</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Previously generated problems saved to your account.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedProblems.map((problem) =>
                    renderProblemCard(problem, { isSaved: true, dbId: problem.id, progress: problem.progress })
                  )}
                </div>
              </div>
            ) : null}

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
                  {generatedProblems.map((problem) => renderProblemCard(problem, { isGenerated: true }))}
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
