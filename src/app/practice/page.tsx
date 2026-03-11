"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PROBLEM_BANK } from "@/data/problem-bank";
import { CURATED_PATTERNS, CURATED_PROBLEMS } from "@/data/curated-75";
import DailyChallengeCard from "@/components/gamification/DailyChallengeCard";

const ITEMS_PER_PAGE = 24;

const COMPANY_FILTERS = ["All", "Google", "Amazon", "Meta", "Apple", "Netflix", "General"];
const DIFFICULTY_FILTERS = ["All", "EASY", "MEDIUM", "HARD"];
const CATEGORY_FILTERS = ["All", "Arrays", "Strings", "LinkedLists", "Trees", "Graph", "DynamicProgramming", "Sorting", "StackQueue", "Design", "Math", "Greedy", "Backtracking", "SlidingWindow", "Recursion"];

const PATTERN_FILTERS = ["All", ...CURATED_PATTERNS.map(p => p.id)];
const PATTERN_LABELS: Record<string, string> = {};
for (const p of CURATED_PATTERNS) { PATTERN_LABELS[p.id] = p.name; }

// Build set of curated problem IDs for badge display
const CURATED_IDS = new Set(CURATED_PROBLEMS.map(p => p.id));

const AI_LEVEL_OPTIONS = [
  { value: 0, label: "L0 No AI", description: "Solve independently", color: "text-accent-red", border: "border-accent-red/30", bg: "bg-accent-red/10" },
  { value: 1, label: "L1 Hint", description: "Socratic questions only", color: "text-yellow-400", border: "border-yellow-500/30", bg: "bg-yellow-500/10" },
  { value: 2, label: "L2 Scaffold", description: "Solution skeletons", color: "text-india-green", border: "border-blue-500/30", bg: "bg-india-green/10" },
  { value: 3, label: "L3 Guide", description: "Concept explanations", color: "text-saffron", border: "border-saffron/30", bg: "bg-saffron/10" },
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
  HARD: { text: "text-accent-red", bg: "bg-accent-red/10", border: "border-accent-red/30" },
};

export default function PracticeModePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>}>
      <PracticeModeContent />
    </Suspense>
  );
}

function PracticeModeContent() {
  const searchParamsHook = useSearchParams();
  const [selectedAiLevel, setSelectedAiLevel] = useState(2);
  const [activeTab, setActiveTab] = useState<"problems" | "generate" | "studyplans">("problems");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [patternFilter, setPatternFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Progress tracking
  const [progressMap, setProgressMap] = useState<Record<string, string>>({});

  // Initialize pattern filter from URL
  useEffect(() => {
    const pattern = searchParamsHook.get("pattern");
    if (pattern) {
      setPatternFilter(pattern);
      setActiveTab("problems");
    }
  }, [searchParamsHook]);

  // Fetch practice progress
  useEffect(() => {
    fetch("/api/practice/progress")
      .then((res) => (res.ok ? res.json() : { progress: [] }))
      .then((data) => {
        const map: Record<string, string> = {};
        if (Array.isArray(data.progress)) {
          for (const p of data.progress) {
            map[p.bankProblemId] = p.status;
          }
        }
        setProgressMap(map);
      })
      .catch(() => {});
  }, []);

  // Merge curated + bank (curated first, deduplicated)
  const allProblems = useMemo(() => {
    const bankIds = new Set(CURATED_PROBLEMS.map(p => p.id));
    const rest = PROBLEM_BANK.filter(p => !bankIds.has(p.id));
    return [...CURATED_PROBLEMS, ...rest];
  }, []);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return allProblems.filter((p) => {
      if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.description.toLowerCase().includes(searchQuery.toLowerCase()) && !p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
      if (companyFilter !== "All") {
        if (companyFilter === "General") { if (p.company) return false; }
        else { if (p.company !== companyFilter) return false; }
      }
      if (difficultyFilter !== "All" && p.difficulty !== difficultyFilter) return false;
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (patternFilter !== "All" && p.pattern !== patternFilter) return false;
      return true;
    });
  }, [searchQuery, companyFilter, difficultyFilter, categoryFilter, patternFilter, allProblems]);

  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE);
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  const updateFilter = (setter: (v: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // Daily challenge
  const [dailyChallenge, setDailyChallenge] = useState<{
    problem: { id: string; title: string; difficulty: string; description: string; tags: string } | null;
    bonusXP: number;
    completed: boolean;
    timeUntilNextMs: number;
  } | null>(null);

  // Gamification stats for header
  const [gamStats, setGamStats] = useState<{ level: number; currentStreak: number; xp: number } | null>(null);

  useEffect(() => {
    fetch("/api/gamification/daily-challenge")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.challenge) setDailyChallenge(data.challenge); })
      .catch(() => {});
    fetch("/api/gamification/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setGamStats({ level: data.level, currentStreak: data.currentStreak, xp: data.xp }); })
      .catch(() => {});
  }, []);

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

  function renderProblemCard(problem: { id: string; title: string; difficulty: string; description: string; tags: string[]; company?: string | null; pattern?: string; testCases?: { input: string; expected: string }[] }, options: { isGenerated?: boolean; isSaved?: boolean; dbId?: string; progress?: SavedProblem["progress"] } = {}) {
    const { isGenerated = false, isSaved = false, dbId, progress } = options;
    const diff = difficultyColors[problem.difficulty] || difficultyColors.MEDIUM;
    const isCurated = CURATED_IDS.has(problem.id);
    const progressStatus = progress?.status || progressMap[problem.id];
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
        className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-saffron/30 hover:bg-white"
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${diff.text} ${diff.bg} ${diff.border}`}
          >
            {problem.difficulty}
          </span>
          <div className="flex gap-1 flex-wrap justify-end">
            {isCurated && (
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] text-emerald-400">
                Curated
              </span>
            )}
            {problem.testCases && problem.testCases.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] text-cyan-400">
                {problem.testCases.length} tests
              </span>
            )}
            {problem.company && (
              <span className="inline-flex items-center rounded-full bg-india-green/10 border border-blue-500/30 px-2 py-0.5 text-[10px] text-india-green">
                {problem.company}
              </span>
            )}
            {(isGenerated || isSaved) && (
              <span className="inline-flex items-center rounded-full bg-saffron/10 border border-saffron/30 px-2 py-0.5 text-[10px] text-saffron">
                AI Generated
              </span>
            )}
            {progressStatus && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${
                progressStatus === "COMPLETED"
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400"
              }`}>
                {progressStatus === "COMPLETED" ? "Solved" : "In Progress"}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-saffron-dark transition-colors">
          {problem.title}
        </h3>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {problem.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {problem.pattern && (
            <span className="rounded bg-saffron-dark/30 border border-saffron/20 px-2 py-0.5 text-[10px] text-saffron-dark">
              {PATTERN_LABELS[problem.pattern] || problem.pattern}
            </span>
          )}
          {problem.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            +{{ EASY: 10, MEDIUM: 25, HARD: 50 }[problem.difficulty] || 10} XP
          </span>
          <Link
            href={href}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-saffron bg-transparent px-4 py-2.5 text-sm font-medium text-saffron transition-colors hover:bg-saffron/10"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {progressStatus === "COMPLETED" ? "Review" : progressStatus === "IN_PROGRESS" ? "Continue" : "Start Practice"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/candidate" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-saffron">Practice Mode</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Practice Mode
              </h1>
              <p className="mt-2 text-gray-500 max-w-2xl">
                Sharpen your coding skills with curated problems or generate custom ones tailored to your target company and role.
              </p>
            </div>
            {gamStats && (
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron/10 text-sm font-bold text-saffron">{gamStats.level}</span>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">Level {gamStats.level}</p>
                    <p className="text-[10px] text-gray-400">{gamStats.xp.toLocaleString()} XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-base ${gamStats.currentStreak > 0 ? "animate-pulse" : "opacity-40"}`}>🔥</span>
                  <span className="text-sm font-semibold text-gray-700">{gamStats.currentStreak}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Daily Challenge Banner */}
        {dailyChallenge?.problem && (
          <div className="mb-8">
            <DailyChallengeCard
              problem={dailyChallenge.problem}
              bonusXP={dailyChallenge.bonusXP}
              completed={dailyChallenge.completed}
              timeUntilNextMs={dailyChallenge.timeUntilNextMs}
            />
          </div>
        )}

        {/* AI Level Selector */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">AI Assistance Level</h2>
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
                    ? `${option.border} ${option.bg} ring-1 ring-saffron/50`
                    : "border-gray-200 bg-white hover:border-gray-200 hover:bg-white"
                }`}
              >
                {selectedAiLevel === option.value && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-saffron" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="flex gap-1 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("studyplans")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "studyplans"
                ? "border-saffron text-saffron"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Study Plans
          </button>
          <button
            onClick={() => setActiveTab("problems")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "problems"
                ? "border-saffron text-saffron"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Practice Problems ({allProblems.length})
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "generate"
                ? "border-saffron text-saffron"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Practice Generator
          </button>
          <Link
            href="/practice/analytics"
            className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </Link>
        </div>

        {/* Study Plans Tab */}
        {activeTab === "studyplans" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Study Plans</h2>
              <p className="text-sm text-gray-500">
                Master essential coding patterns with curated problem sets. Each pattern builds skills needed for technical interviews.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CURATED_PATTERNS.map((pattern) => {
                const easy = pattern.problems.filter(p => p.difficulty === "EASY").length;
                const medium = pattern.problems.filter(p => p.difficulty === "MEDIUM").length;
                const hard = pattern.problems.filter(p => p.difficulty === "HARD").length;
                const solved = pattern.problems.filter(p => progressMap[p.id] === "COMPLETED").length;
                const progress = pattern.problems.length > 0 ? Math.round((solved / pattern.problems.length) * 100) : 0;
                return (
                  <div
                    key={pattern.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 hover:border-saffron/30 hover:bg-white transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">{pattern.name}</h3>
                      <span className="text-xs text-gray-500">{pattern.problems.length} problems</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{pattern.description}</p>

                    {/* Difficulty breakdown */}
                    <div className="flex gap-2 mb-3">
                      {easy > 0 && (
                        <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">{easy} Easy</span>
                      )}
                      {medium > 0 && (
                        <span className="text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-2 py-0.5">{medium} Med</span>
                      )}
                      {hard > 0 && (
                        <span className="text-[10px] text-accent-red bg-accent-red/10 border border-red-500/20 rounded-full px-2 py-0.5">{hard} Hard</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                        <span>{solved}/{pattern.problems.length} solved</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-saffron rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => { setPatternFilter(pattern.id); setActiveTab("problems"); setCurrentPage(1); }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-saffron bg-transparent px-4 py-2.5 text-sm font-medium text-saffron transition-colors hover:bg-saffron/10"
                    >
                      {progress > 0 ? "Continue Pattern" : "Start Pattern"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron"
              />
              <div className="flex flex-wrap gap-2">
                <select value={companyFilter} onChange={(e) => updateFilter(setCompanyFilter, e.target.value)} className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 focus:border-saffron focus:outline-none">
                  {COMPANY_FILTERS.map(c => <option key={c} value={c}>{c === "All" ? "All Companies" : c}</option>)}
                </select>
                <select value={difficultyFilter} onChange={(e) => updateFilter(setDifficultyFilter, e.target.value)} className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 focus:border-saffron focus:outline-none">
                  {DIFFICULTY_FILTERS.map(d => <option key={d} value={d}>{d === "All" ? "All Difficulties" : d}</option>)}
                </select>
                <select value={categoryFilter} onChange={(e) => updateFilter(setCategoryFilter, e.target.value)} className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 focus:border-saffron focus:outline-none">
                  {CATEGORY_FILTERS.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                </select>
                <select value={patternFilter} onChange={(e) => updateFilter(setPatternFilter, e.target.value)} className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-900 focus:border-saffron focus:outline-none">
                  {PATTERN_FILTERS.map(p => <option key={p} value={p}>{p === "All" ? "All Patterns" : PATTERN_LABELS[p] || p}</option>)}
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-30">Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)} className={`rounded-lg px-3 py-1.5 text-sm ${currentPage === page ? "bg-gray-100 text-gray-900 border border-saffron" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{page}</button>
                  );
                })}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-30">Next</button>
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
                <svg className="animate-spin h-6 w-6 text-saffron mx-auto mb-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm text-gray-500">Loading saved problems...</p>
              </div>
            ) : savedProblems.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Practice Problems</h3>
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
            <div className="rounded-xl border border-saffron/20 bg-gradient-to-r from-saffron/5 via-gray-900/50 to-india-green/5 p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Generate Company-Specific Practice</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Enter a company name, role, and optionally a job description. AI will generate relevant coding problems tailored to what that company typically asks for that position.
              </p>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Company Name <span className="text-gray-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Stripe, Airbnb, Spotify"
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Role <span className="text-accent-red">*</span>
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                      placeholder="e.g., Senior Backend Engineer, Frontend Developer"
                      className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Description / Skills to Test <span className="text-gray-600">(optional)</span>
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={3}
                    placeholder="Paste a job description or describe specific skills: e.g., 'Must know distributed systems, API design, and SQL optimization. Team works on payment processing infrastructure.'"
                    className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:border-saffron focus:outline-none focus:ring-1 focus:ring-saffron transition-colors resize-none"
                  />
                </div>

                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-gray-900 focus:border-saffron focus:outline-none"
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
                    className="rounded-lg bg-gradient-to-r from-saffron to-india-green px-6 py-2.5 text-sm font-semibold text-gray-900 hover:from-saffron-light hover:to-india-green-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
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
                <div className="mt-4 rounded-lg border border-accent-red/30 bg-accent-red/10 px-4 py-3 text-sm text-accent-red">
                  {genError}
                </div>
              )}
            </div>

            {/* Generated Problems */}
            {generatedProblems.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
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
                <svg className="animate-spin h-8 w-8 text-saffron mx-auto mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-gray-500">AI is generating practice problems tailored to your specifications...</p>
                <p className="text-xs text-gray-600 mt-1">This may take 10-15 seconds</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
