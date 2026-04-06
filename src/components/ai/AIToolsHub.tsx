"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CaseStudioTool from "@/components/ai/CaseStudioTool";
import MockPackTool from "@/components/ai/MockPackTool";

type ProgressItem = {
  id: string;
  bankProblemId: string | null;
  status: string;
  timeSpentSeconds: number;
  lastSavedAt: string;
  problemTitle?: string | null;
  problemDifficulty?: string | null;
  problemCategory?: string | null;
  problemPattern?: string | null;
};

type Recommendation = {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  pattern?: string;
  score: number;
  reasons: string[];
};

type LearningBrief = {
  summary: string;
  theoryHighlights: string[];
  codeReview: string[];
  errorDiagnosis: string[];
  nextSteps: string[];
  interviewFraming: string[];
};

const workflowTracks = [
  {
    eyebrow: "Non-coding roles",
    title: "Generate proof for product, sales, ops, marketing, and automation roles",
    description:
      "Use Case Studio to create a realistic work sample, turn it into a Mock Pack for interview prep, then move the strongest evidence into your career kit.",
    items: [
      "Create a role-specific case brief with deliverables and evaluation criteria",
      "Generate interviewer-style questions, answer shapes, and red flags",
      "Convert the output into recruiter-ready bullets and talking points",
    ],
    cta: { label: "Start with case studio", href: "#case-studio" },
  },
  {
    eyebrow: "Engineering prep",
    title: "Use your coding history to plan the next reps",
    description:
      "Learning Briefs, recommendations, and AI-generated practice are the developer-side workflow. These tools depend on practice history and point you back into coding prep.",
    items: [
      "Summarize a recent coding attempt into strengths, weak spots, and next steps",
      "Get the next recommended problems from your actual weakness profile",
      "Generate fresh coding problems when you need more targeted practice",
    ],
    cta: { label: "Jump to developer AI", href: "#learning-brief" },
  },
];

const candidateTools = [
  {
    title: "Case studio",
    audience: "Non-coding roles",
    description:
      "Generate a realistic business case with deliverables, evaluation criteria, portfolio proof, and mock questions for product, sales, marketing, ops, finance, HR, and automation roles.",
    cta: { label: "Open case studio", href: "#case-studio" },
  },
  {
    title: "Mock pack",
    audience: "Non-coding roles",
    description:
      "Build the opener, question set, scorecard signals, follow-ups, and prep checklist for your next business-role interview.",
    cta: { label: "Open mock pack", href: "#mock-pack" },
  },
  {
    title: "AI career kit",
    audience: "All candidates",
    description:
      "Generate a stronger headline, About section, resume bullets, recruiter outreach, and interview pitch from your background and verified theprintf.com signals.",
    cta: { label: "Build my kit", href: "/candidate/career-kit" },
  },
];

const engineeringTools = [
  {
    title: "Learning briefs",
    audience: "Developer practice",
    description:
      "Summaries turn raw coding-practice history into a concise diagnosis: what you understand, what is breaking, and what to do next.",
    cta: { label: "Generate a brief", href: "#learning-brief" },
  },
  {
    title: "Weakness-based recommendations",
    audience: "Developer practice",
    description:
      "Your next coding practice set is chosen from actual weakness signals instead of random topic hopping.",
    cta: { label: "See recommendations", href: "#recommendations" },
  },
  {
    title: "AI-generated practice",
    audience: "Developer practice",
    description:
      "Generate coding problems tailored to a company, role, and job description when you need targeted reps quickly.",
    cta: { label: "Generate problems", href: "/practice?tab=generate" },
  },
];

const companyCapabilities = [
  "Generate interview templates from natural language",
  "Create role-specific question sets with AI",
  "Control AI levels per round and per question",
  "Audit every session with structured scoring",
];

function formatMinutes(seconds: number) {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export default function AIToolsHub() {
  const { status } = useSession();
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState<string>("");
  const [brief, setBrief] = useState<LearningBrief | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;

    setLoadingData(true);
    Promise.all([
      fetch("/api/practice/progress").then((res) => (res.ok ? res.json() : { progress: [] })),
      fetch("/api/practice/recommend?count=5").then((res) =>
        res.ok ? res.json() : { recommendations: [] }
      ),
    ])
      .then(([progressData, recommendationData]) => {
        const recentProgress = (progressData.progress || []).filter(
          (item: ProgressItem) => item.bankProblemId
        );
        setProgress(recentProgress);
        setRecommendations(recommendationData.recommendations || []);
        setSelectedProblemId((current) => current || recentProgress[0]?.bankProblemId || "");
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [status]);

  const selectedProblem = useMemo(
    () => progress.find((item) => item.bankProblemId === selectedProblemId) || null,
    [progress, selectedProblemId]
  );

  async function handleGenerateBrief() {
    if (!selectedProblemId) return;
    setBriefLoading(true);
    setBriefError("");
    try {
      const res = await fetch("/api/practice/learning-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankProblemId: selectedProblemId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate learning brief");
      }
      setBrief(data.brief);
    } catch (error) {
      setBriefError(error instanceof Error ? error.message : "Failed to generate learning brief");
    } finally {
      setBriefLoading(false);
    }
  }

  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">
        <div className="gradient-orb h-[520px] w-[520px] bg-saffron/10 -top-32 left-0" />
        <div className="gradient-orb h-[420px] w-[420px] bg-india-green/10 right-0 top-10" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-gray-400">AI capabilities</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
              AI that helps you
              <br />
              <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent">
                prepare, perform, and prove.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-500">
              This page has two working AI workflows. For product, sales, marketing, ops, customer success,
              finance, HR, project management, and automation roles, use Case Studio, Mock Pack, and Career
              Kit. For software interview prep, use Learning Briefs, recommendations, and AI-generated
              coding practice.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["case briefs", "mock packs", "career kit", "learning briefs", "AI practice"].map((item) => (
                <span key={item} className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600">
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="#case-studio" className="pill-cta-primary">
                Open case studio
              </Link>
              <Link href="#mock-pack" className="pill-cta-secondary">
                Build mock pack
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {workflowTracks.map((track) => (
            <div
              key={track.title}
              className="rounded-[32px] border border-gray-200 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">{track.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">{track.title}</h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">{track.description}</p>
              <ul className="mt-5 space-y-2">
                {track.items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href={track.cta.href}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-saffron"
              >
                {track.cta.label}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Non-coding roles</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Working tools for business-role prep</h2>
            <div className="mt-5 grid gap-4">
              {candidateTools.map((capability) => (
                <div
                  key={capability.title}
                  className="rounded-[28px] border border-gray-200 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm"
                >
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                    {capability.audience}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{capability.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-500">{capability.description}</p>
                  <Link
                    href={capability.cta.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-saffron"
                  >
                    {capability.cta.label}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Engineering prep</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Working tools for coding interviews</h2>
            <div className="mt-5 grid gap-4">
              {engineeringTools.map((capability) => (
                <div
                  key={capability.title}
                  className="rounded-[28px] border border-gray-200 bg-white/80 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.25)] backdrop-blur-sm"
                >
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                    {capability.audience}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">{capability.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-500">{capability.description}</p>
                  <Link
                    href={capability.cta.href}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-saffron"
                  >
                    {capability.cta.label}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <CaseStudioTool />
          <MockPackTool />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-gray-200 bg-white/80 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Personal AI workspace</p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">Career proof plus developer practice AI</h2>
              </div>
              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                {isAuthenticated ? "Connected" : "Sign in for personalization"}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-gray-500">
              For non-coding roles, the main workflow is Case Studio, Mock Pack, and Career Kit. For software
              interview prep, the panels on the right and below summarize your coding history, recommend the
              next problems, and turn recent work into a clearer action plan.
            </p>

            <div className="mt-6 rounded-[28px] border border-gray-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Candidate-only workspace</p>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">AI career kit</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Build recruiter-ready assets from your own background, then strengthen them with verified
                practice and interview evidence where theprintf.com has it.
              </p>
              <Link
                href="/candidate/career-kit"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-saffron"
              >
                Open career kit
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="mt-6 rounded-[28px] border border-gray-200 bg-gray-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">For hiring teams</p>
              <ul className="mt-3 space-y-2">
                {companyCapabilities.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signup?role=company"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-saffron"
              >
                Explore company AI tools
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {!isAuthenticated && (
              <div className="mt-6 rounded-[28px] border border-dashed border-gray-300 bg-white p-5">
                <h3 className="text-lg font-semibold text-gray-900">Unlock personalized AI</h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Sign in to generate learning briefs from your own practice history and get AI-selected next problems.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href="/auth/signin" className="pill-cta-primary">
                    Sign in
                  </Link>
                  <Link href="/auth/signup?role=candidate" className="pill-cta-secondary">
                    Create candidate account
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div id="learning-brief" className="rounded-[32px] bg-gray-950 p-6 text-white shadow-[0_28px_90px_-36px_rgba(15,23,42,0.65)]">
            <div className="flex flex-col gap-5 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Developer learning brief</p>
                <h2 className="mt-2 text-2xl font-semibold">Summarize my coding practice</h2>
              </div>
              {isAuthenticated && progress.length > 0 && (
                <button
                  type="button"
                  onClick={handleGenerateBrief}
                  disabled={briefLoading || !selectedProblemId}
                  className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {briefLoading ? "Generating..." : "Generate brief"}
                </button>
              )}
            </div>

            {!isAuthenticated && (
              <p className="mt-5 text-sm leading-6 text-gray-400">
                Sign in to generate a brief from your latest practice attempts.
              </p>
            )}

            {isAuthenticated && loadingData && (
              <p className="mt-5 text-sm text-gray-400">Loading your AI workspace...</p>
            )}

            {isAuthenticated && !loadingData && progress.length === 0 && (
              <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-gray-300">You have no saved practice history yet.</p>
                <p className="mt-2 text-sm text-gray-500">
                  Start a problem in Practice Mode, then come back here to generate a personalized summary.
                </p>
                <Link href="/practice" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white">
                  Go to practice
                </Link>
              </div>
            )}

            {isAuthenticated && !loadingData && progress.length > 0 && (
              <>
                <div className="mt-5 flex flex-wrap gap-2">
                  {progress.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.bankProblemId) {
                          setSelectedProblemId(item.bankProblemId);
                          setBrief(null);
                          setBriefError("");
                        }
                      }}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        selectedProblemId === item.bankProblemId
                          ? "border-saffron/40 bg-saffron/15 text-white"
                          : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                      }`}
                    >
                      {item.problemTitle || item.bankProblemId}
                    </button>
                  ))}
                </div>

                {selectedProblem && (
                  <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-gray-300">
                        {selectedProblem.problemDifficulty || "Unknown difficulty"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-gray-300">
                        {selectedProblem.problemCategory || "General"}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-gray-300">
                        {selectedProblem.status.replaceAll("_", " ")}
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-medium text-gray-300">
                        {formatMinutes(selectedProblem.timeSpentSeconds)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">
                      {selectedProblem.problemTitle || selectedProblem.bankProblemId}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      Generate an AI brief to summarize theory, likely gaps, and how to talk through the problem in an interview.
                    </p>
                  </div>
                )}

                {briefError && (
                  <div className="mt-5 rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {briefError}
                  </div>
                )}

                {brief && (
                  <div className="mt-5 grid gap-4">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Summary</p>
                      <p className="mt-3 text-sm leading-7 text-gray-200">{brief.summary}</p>
                    </div>
                    {[
                      { title: "Theory highlights", items: brief.theoryHighlights },
                      { title: "Code review", items: brief.codeReview },
                      { title: "Error diagnosis", items: brief.errorDiagnosis },
                      { title: "Next steps", items: brief.nextSteps },
                      { title: "Interview framing", items: brief.interviewFraming },
                    ].map((section) => (
                      <div key={section.title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">{section.title}</p>
                        <ul className="mt-3 space-y-2">
                          {section.items.map((item) => (
                            <li key={item} className="flex gap-2 text-sm leading-6 text-gray-200">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <section id="recommendations" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-gray-200 bg-white/80 p-6 backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Developer next best moves</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">AI-picked coding recommendations</h2>
            </div>
            <Link href="/practice" className="text-sm font-semibold text-gray-900 hover:text-saffron">
              Open coding practice
            </Link>
          </div>

          {!isAuthenticated && (
            <p className="mt-5 text-sm text-gray-500">
              Sign in to get personalized recommendations based on your coding weakness profile.
            </p>
          )}

          {isAuthenticated && recommendations.length === 0 && !loadingData && (
            <p className="mt-5 text-sm text-gray-500">
              Recommendations will appear once you have enough coding practice history.
            </p>
          )}

          {recommendations.length > 0 && (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map((item) => (
                <Link
                  key={item.id}
                  href={`/practice/${item.id}?aiLevel=2`}
                  className="rounded-3xl border border-gray-200 bg-gray-50/70 p-5 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                      {item.difficulty}
                    </span>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                      {item.category}
                    </span>
                    {item.pattern && (
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                        {item.pattern}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">Recommendation score: {item.score}</p>
                  <ul className="mt-4 space-y-2">
                    {item.reasons.slice(0, 3).map((reason) => (
                      <li key={reason} className="flex gap-2 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-india-green" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
