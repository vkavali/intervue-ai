"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INTERVIEW_TYPES, INDUSTRIES } from "@/data/interview-types";

const NON_CODING_TYPES = ["BEHAVIORAL", "BUSINESS_ANALYST", "PROJECT_MANAGEMENT"];

const TRIVIAL_PATTERNS = [
  /trivia/i,
  /quiz\s*game/i,
  /fun\s*facts/i,
  /pop\s*culture/i,
  /movie\s*quotes/i,
  /sports\s*scores/i,
  /celebrity/i,
  /joke/i,
  /riddle/i,
  /capital\s+of/i,
  /what\s+(is|was|are)\s+the\s+name/i,
  /geography/i,
  /history\s+of/i,
  /who\s+(is|was|are)/i,
  /general\s+knowledge/i,
  /country/i,
  /president/i,
  /world\s+war/i,
  /famous/i,
];

interface Question {
  id: string;
  title: string;
  description: string;
  constraints: string;
  examples: string;
  difficulty: string;
  aiLevel: number;
  timeLimit: number;
  testCases: string | null;
  starterCode: string | null;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const emptyQuestion = (): Question => ({
  id: generateId(),
  title: "",
  description: "",
  constraints: "",
  examples: "",
  difficulty: "MEDIUM",
  aiLevel: -1, // -1 means inherit from template default
  timeLimit: 30,
  testCases: null,
  starterCode: null,
});

const aiLevelLabels: Record<number, string> = {
  0: "L0 - No AI",
  1: "L1 - Hint Only",
  2: "L2 - Scaffold",
  3: "L3 - Guide",
  4: "L4 - Full Copilot",
};

export default function NewInterviewPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [seniority, setSeniority] = useState("MID");
  const [roundType, setRoundType] = useState("Technical");
  const [industry, setIndustry] = useState("");
  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [defaultAiLevel, setDefaultAiLevel] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI Generate Interview state
  const [aiInterviewPrompt, setAiInterviewPrompt] = useState("");
  const [aiInterviewLoading, setAiInterviewLoading] = useState(false);
  const [assessmentCriteria, setAssessmentCriteria] = useState("");
  const [interviewerGuidance, setInterviewerGuidance] = useState("");

  // AI Generate Questions state
  const [showAiQuestionsModal, setShowAiQuestionsModal] = useState(false);
  const [aiQCount, setAiQCount] = useState(3);
  const [aiQTopics, setAiQTopics] = useState("");
  const [aiQDifficulty, setAiQDifficulty] = useState("MIX");
  const [aiQuestionsLoading, setAiQuestionsLoading] = useState(false);

  // Problem Bank state
  const [showBankPanel, setShowBankPanel] = useState(false);
  const [bankProblems, setBankProblems] = useState<
    Array<{
      id: string;
      title: string;
      difficulty: string;
      description: string;
      tags: string[];
      company?: string;
      category: string;
      constraints?: string;
      examples?: string;
      starterCode?: Record<string, string>;
      enriched: boolean;
    }>
  >([]);
  const [bankTotal, setBankTotal] = useState(0);
  const [bankPage, setBankPage] = useState(1);
  const [bankTotalPages, setBankTotalPages] = useState(1);
  const [bankSearch, setBankSearch] = useState("");
  const [bankDifficulty, setBankDifficulty] = useState("");
  const [bankCategory, setBankCategory] = useState("");
  const [bankCompany, setBankCompany] = useState("");
  const [bankCategories, setBankCategories] = useState<string[]>([]);
  const [bankCompanies, setBankCompanies] = useState<string[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSelected, setBankSelected] = useState<Set<string>>(new Set());
  const [bankAddingLoading, setBankAddingLoading] = useState(false);
  const [bankSuggestLoading, setBankSuggestLoading] = useState(false);

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()]);
  }

  function removeQuestion(id: string) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, updates: Partial<Question>) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  }

  async function fetchBankProblems(pageNum = 1) {
    setBankLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if (bankSearch) params.set("search", bankSearch);
      if (bankDifficulty) params.set("difficulty", bankDifficulty);
      if (bankCategory) params.set("category", bankCategory);
      if (bankCompany) params.set("company", bankCompany);

      const res = await fetch(`/api/problems/bank?${params}`);
      const data = await res.json();

      if (res.ok) {
        setBankProblems(data.problems);
        setBankTotal(data.total);
        setBankPage(data.page);
        setBankTotalPages(data.totalPages);
        if (data.filters) {
          setBankCategories(data.filters.categories || []);
          setBankCompanies(data.filters.companies || []);
        }
      }
    } catch {
      // silently fail
    } finally {
      setBankLoading(false);
    }
  }

  function toggleBankSelection(problemId: string) {
    setBankSelected((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      return next;
    });
  }

  async function handleAutoSuggest() {
    setBankSuggestLoading(true);
    try {
      const params = new URLSearchParams({
        count: "3",
        seniority,
      });
      if (bankDifficulty) params.set("difficulty", bankDifficulty);
      if (bankCompany) params.set("company", bankCompany);

      const res = await fetch(`/api/problems/bank/suggest?${params}`);
      const data = await res.json();

      if (res.ok && data.problems) {
        setBankSelected(new Set(data.problems.map((p: { id: string }) => p.id)));
      }
    } catch {
      // silently fail
    } finally {
      setBankSuggestLoading(false);
    }
  }

  async function handleAddSelectedBankProblems() {
    if (bankSelected.size === 0) return;
    setBankAddingLoading(true);
    setError("");

    try {
      const selectedProblems = bankProblems.filter((p) => bankSelected.has(p.id));
      const newQuestions: Question[] = [];

      for (const problem of selectedProblems) {
        // Enrich the problem if needed
        let enriched = problem;
        if (!problem.enriched) {
          try {
            const res = await fetch("/api/problems/bank/enrich", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ bankProblemId: problem.id }),
            });
            if (res.ok) {
              enriched = await res.json();
            }
          } catch {
            // Use unenriched version
          }
        }

        newQuestions.push({
          id: generateId(),
          title: enriched.title,
          description: enriched.description,
          constraints: enriched.constraints || "",
          examples: enriched.examples || "",
          difficulty: enriched.difficulty,
          aiLevel: -1,
          timeLimit: enriched.difficulty === "HARD" ? 45 : enriched.difficulty === "MEDIUM" ? 30 : 20,
          testCases: null,
          starterCode: enriched.starterCode ? JSON.stringify(enriched.starterCode) : null,
        });
      }

      setQuestions((prev) => {
        const hasOnlyEmptyQuestion =
          prev.length === 1 && !prev[0].title && !prev[0].description;
        if (hasOnlyEmptyQuestion) return newQuestions;
        return [...prev, ...newQuestions];
      });

      setBankSelected(new Set());
      setShowBankPanel(false);
    } catch {
      setError("Failed to add selected problems.");
    } finally {
      setBankAddingLoading(false);
    }
  }

  async function handleGenerateInterview() {
    if (!aiInterviewPrompt.trim()) return;

    // Require role, interviewType, and industry before AI generation
    if (!role.trim()) {
      setError("Please specify a Role before generating with AI.");
      return;
    }
    if (!interviewType) {
      setError("Please select an Interview Type before generating with AI.");
      return;
    }
    if (!industry) {
      setError("Please select an Industry before generating with AI.");
      return;
    }

    const promptText = aiInterviewPrompt.trim();

    // Check for trivial / irrelevant prompts
    if (TRIVIAL_PATTERNS.some((pattern) => pattern.test(promptText))) {
      setError(
        "Please describe job-specific skills and competencies to assess, not general knowledge questions."
      );
      return;
    }

    setAiInterviewLoading(true);
    setError("");
    setAssessmentCriteria("");
    setInterviewerGuidance("");

    try {
      const res = await fetch("/api/ai/generate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiInterviewPrompt,
          role,
          seniority: seniority || undefined,
          interviewType,
          industry,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate interview template");
        setAiInterviewLoading(false);
        return;
      }

      // Auto-fill the entire form
      const { template, assessmentCriteria: criteria, interviewerGuidance: guidance } = data;

      setTitle(template.title);
      setRole(template.role);
      setSeniority(template.seniority);
      setRoundType(template.roundType);
      setDefaultAiLevel(template.defaultAiLevel);

      // Convert template questions to our Question format
      const newQuestions: Question[] = template.questions.map(
        (q: {
          title: string;
          description: string;
          constraints: string;
          examples: string;
          difficulty: string;
          aiLevel: number;
          timeLimit: number;
          testCases?: string | null;
          starterCode?: string | null;
        }) => ({
          id: generateId(),
          title: q.title,
          description: q.description,
          constraints: q.constraints,
          examples: q.examples,
          difficulty: q.difficulty,
          aiLevel: q.aiLevel === template.defaultAiLevel ? -1 : q.aiLevel,
          timeLimit: q.timeLimit,
          testCases: q.testCases ?? null,
          starterCode: q.starterCode ?? null,
        })
      );

      setQuestions(newQuestions.length > 0 ? newQuestions : [emptyQuestion()]);
      setAssessmentCriteria(criteria || "");
      setInterviewerGuidance(guidance || "");
    } catch {
      setError("An unexpected error occurred while generating the interview.");
    } finally {
      setAiInterviewLoading(false);
    }
  }

  async function handleGenerateQuestions() {
    if (!role || !roundType) {
      setError(
        "Please fill in the Role and Round Type fields before generating questions."
      );
      return;
    }

    setAiQuestionsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          seniority,
          roundType,
          count: aiQCount,
          topics: aiQTopics || undefined,
          difficulty: aiQDifficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate questions");
        setAiQuestionsLoading(false);
        return;
      }

      // Append generated questions to the current list
      const newQuestions: Question[] = data.questions.map(
        (q: {
          title: string;
          description: string;
          constraints: string;
          examples: string;
          difficulty: string;
          aiLevel: number;
          timeLimit: number;
          testCases?: string | null;
          starterCode?: string | null;
        }) => ({
          id: generateId(),
          title: q.title,
          description: q.description,
          constraints: q.constraints,
          examples: q.examples,
          difficulty: q.difficulty,
          aiLevel: q.aiLevel === defaultAiLevel ? -1 : q.aiLevel,
          timeLimit: q.timeLimit,
          testCases: q.testCases ?? null,
          starterCode: q.starterCode ?? null,
        })
      );

      // If the only existing question is empty, replace it; otherwise append
      setQuestions((prev) => {
        const hasOnlyEmptyQuestion =
          prev.length === 1 &&
          !prev[0].title &&
          !prev[0].description;
        if (hasOnlyEmptyQuestion) {
          return newQuestions;
        }
        return [...prev, ...newQuestions];
      });

      setShowAiQuestionsModal(false);
      setAiQTopics("");
    } catch {
      setError("An unexpected error occurred while generating questions.");
    } finally {
      setAiQuestionsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        title,
        role,
        seniority,
        roundType,
        industry: industry || undefined,
        interviewType,
        defaultAiLevel,
        questions: questions.map((q) => ({
          title: q.title,
          description: q.description,
          constraints: q.constraints || undefined,
          examples: q.examples || undefined,
          difficulty: q.difficulty,
          aiLevel: q.aiLevel === -1 ? undefined : q.aiLevel,
          timeLimit: q.timeLimit,
          testCases: q.testCases || undefined,
          starterCode: q.starterCode || undefined,
        })),
      };

      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create template");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/interviews/${data.id}`);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Create Interview Template
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure the interview structure and add questions
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* AI Generate Interview Section */}
      <div className="mb-8 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-blue-500/5 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              AI Generate Interview
            </h2>
            <p className="text-sm text-gray-400">
              Describe your ideal interview and let AI build it for you
            </p>
          </div>
        </div>

        <textarea
          rows={4}
          value={aiInterviewPrompt}
          onChange={(e) => setAiInterviewPrompt(e.target.value)}
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          placeholder="e.g., I need a 45-minute React interview for a senior developer. Focus on hooks, performance optimization, and state management. Test problem-solving ability and code quality. Use moderate AI assistance."
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={aiInterviewLoading || !aiInterviewPrompt.trim() || !role.trim() || !interviewType || !industry}
            onClick={handleGenerateInterview}
            title={!role.trim() || !interviewType || !industry ? "Fill in Role, Interview Type, and Industry first" : ""}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiInterviewLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating Interview...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assessment Criteria & Interviewer Guidance Info Cards */}
      {(assessmentCriteria || interviewerGuidance) && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessmentCriteria && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-emerald-400">
                  Assessment Criteria
                </h3>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {assessmentCriteria}
              </p>
            </div>
          )}

          {interviewerGuidance && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-sm font-semibold text-blue-400">
                  Interviewer Guidance
                </h3>
              </div>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {interviewerGuidance}
              </p>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Template Details */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">
            Template Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., Senior Backend Engineer - System Design"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Role
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                placeholder="e.g., Backend Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Seniority
              </label>
              <select
                value={seniority}
                onChange={(e) => setSeniority(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="STAFF">Staff</option>
                <option value="PRINCIPAL">Principal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Round Type
              </label>
              <select
                value={roundType}
                onChange={(e) => setRoundType(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="Technical">Technical</option>
                <option value="System Design">System Design</option>
                <option value="Behavioral">Behavioral</option>
                <option value="Take Home">Take Home</option>
                <option value="Live Coding">Live Coding</option>
                <option value="SQL">SQL</option>
                <option value="Business Analysis">Business Analysis</option>
                <option value="Project Management">Project Management</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select industry (optional)</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                {INTERVIEW_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {INTERVIEW_TYPES.find((t) => t.value === interviewType)
                ?.description && (
                <p className="mt-1 text-xs text-gray-500">
                  {
                    INTERVIEW_TYPES.find((t) => t.value === interviewType)
                      ?.description
                  }
                </p>
              )}
            </div>

            {!NON_CODING_TYPES.includes(interviewType) && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Default AI Level
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={defaultAiLevel}
                  onChange={(e) =>
                    setDefaultAiLevel(parseInt(e.target.value))
                  }
                  className="w-full accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>L0</span>
                  <span>L1</span>
                  <span>L2</span>
                  <span>L3</span>
                  <span>L4</span>
                </div>
                <p className="text-sm font-medium text-purple-400">
                  {aiLevelLabels[defaultAiLevel]}
                </p>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Questions ({questions.length})
            </h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowBankPanel((v) => !v);
                  if (!showBankPanel) fetchBankProblems(1);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Browse Problem Bank
              </button>
              <button
                type="button"
                onClick={() => setShowAiQuestionsModal(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-300"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generate Questions
              </button>
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>
          </div>

          {/* AI Generate Questions Modal */}
          {showAiQuestionsModal && (
            <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-400">
                  AI Question Generator
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAiQuestionsModal(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={aiQCount}
                    onChange={(e) =>
                      setAiQCount(
                        Math.min(Math.max(parseInt(e.target.value) || 1, 1), 10)
                      )
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Difficulty Preference
                  </label>
                  <select
                    value={aiQDifficulty}
                    onChange={(e) => setAiQDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="MIX">Mix of difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Specific Topics (optional)
                  </label>
                  <input
                    type="text"
                    value={aiQTopics}
                    onChange={(e) => setAiQTopics(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g., arrays, trees, dynamic programming"
                  />
                </div>
              </div>

              {!role && (
                <p className="text-xs text-amber-400 mb-3">
                  Fill in the Role and Round Type fields above first so AI can generate relevant questions.
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiQuestionsModal(false)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={aiQuestionsLoading || !role || !roundType}
                  onClick={handleGenerateQuestions}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiQuestionsLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate Questions
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Problem Bank Panel */}
          {showBankPanel && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-emerald-400">
                  Problem Bank ({bankTotal} problems)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBankPanel(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={(e) => setBankSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        fetchBankProblems(1);
                      }
                    }}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Search problems..."
                  />
                </div>
                <div>
                  <select
                    value={bankDifficulty}
                    onChange={(e) => setBankDifficulty(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <select
                    value={bankCategory}
                    onChange={(e) => setBankCategory(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">All Categories</option>
                    {bankCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={bankCompany}
                    onChange={(e) => setBankCompany(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">All Companies</option>
                    {bankCompanies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => fetchBankProblems(1)}
                  disabled={bankLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                >
                  {bankLoading ? "Searching..." : "Search"}
                </button>
                <button
                  type="button"
                  onClick={handleAutoSuggest}
                  disabled={bankSuggestLoading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {bankSuggestLoading ? "Suggesting..." : `Auto-Select for ${seniority}`}
                </button>
                {bankSelected.size > 0 && (
                  <span className="text-xs text-emerald-400">
                    {bankSelected.size} selected
                  </span>
                )}
              </div>

              {/* Problem List */}
              <div className="max-h-80 overflow-y-auto space-y-2 mb-4">
                {bankProblems.map((problem) => (
                  <label
                    key={problem.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      bankSelected.has(problem.id)
                        ? "border-emerald-500/50 bg-emerald-500/10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={bankSelected.has(problem.id)}
                      onChange={() => toggleBankSelection(problem.id)}
                      className="mt-1 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white truncate">
                          {problem.title}
                        </span>
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            problem.difficulty === "EASY"
                              ? "bg-green-500/10 text-green-400"
                              : problem.difficulty === "MEDIUM"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {problem.difficulty}
                        </span>
                        {problem.company && (
                          <span className="text-[10px] text-gray-500 shrink-0">
                            {problem.company}
                          </span>
                        )}
                        {problem.enriched && (
                          <span className="text-[10px] text-emerald-500 shrink-0">enriched</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {problem.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {problem.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-700 px-1.5 py-0.5 text-[10px] text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </label>
                ))}
                {bankProblems.length === 0 && !bankLoading && (
                  <p className="text-sm text-gray-500 text-center py-6">
                    No problems found. Try adjusting your filters.
                  </p>
                )}
                {bankLoading && (
                  <p className="text-sm text-gray-500 text-center py-6">
                    Loading problems...
                  </p>
                )}
              </div>

              {/* Pagination */}
              {bankTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    type="button"
                    disabled={bankPage <= 1}
                    onClick={() => fetchBankProblems(bankPage - 1)}
                    className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-gray-400">
                    Page {bankPage} of {bankTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={bankPage >= bankTotalPages}
                    onClick={() => fetchBankProblems(bankPage + 1)}
                    className="rounded border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Add Selected Button */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBankPanel(false)}
                  className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bankSelected.size === 0 || bankAddingLoading}
                  onClick={handleAddSelectedBankProblems}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bankAddingLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Enriching & Adding...
                    </>
                  ) : (
                    `Add ${bankSelected.size} Selected`
                  )}
                </button>
              </div>
            </div>
          )}

          {questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-xl border border-gray-800 bg-gray-900 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-gray-300">
                  Question {index + 1}
                </h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(question.id, { title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g., Two Sum"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={question.description}
                    onChange={(e) =>
                      updateQuestion(question.id, {
                        description: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                    placeholder="Describe the problem statement..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Constraints
                    </label>
                    <textarea
                      rows={3}
                      value={question.constraints}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          constraints: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      placeholder="e.g., 1 <= nums.length <= 10^4"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Examples
                    </label>
                    <textarea
                      rows={3}
                      value={question.examples}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          examples: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                      placeholder="Input: nums = [2,7,11,15], target = 9&#10;Output: [0,1]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Difficulty
                    </label>
                    <select
                      value={question.difficulty}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      AI Level Override
                    </label>
                    <select
                      value={question.aiLevel}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          aiLevel: parseInt(e.target.value),
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                      <option value={-1}>Use template default (L{defaultAiLevel})</option>
                      <option value={0}>L0 - No AI</option>
                      <option value={1}>L1 - Hint Only</option>
                      <option value={2}>L2 - Scaffold</option>
                      <option value={3}>L3 - Guide</option>
                      <option value={4}>L4 - Full Copilot</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={120}
                      value={question.timeLimit}
                      onChange={(e) =>
                        updateQuestion(question.id, {
                          timeLimit: parseInt(e.target.value) || 30,
                        })
                      }
                      className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="w-full rounded-xl border-2 border-dashed border-gray-700 py-6 text-sm font-medium text-gray-400 transition-colors hover:border-purple-500/50 hover:text-purple-400"
          >
            + Add Another Question
          </button>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </span>
            ) : (
              "Create Template"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
