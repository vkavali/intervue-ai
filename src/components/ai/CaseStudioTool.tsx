"use client";

import { useState } from "react";
import Link from "next/link";
import { INDUSTRIES, INTERVIEW_TYPES } from "@/data/interview-types";
import CopyTextButton from "@/components/ai/CopyTextButton";

type CaseStudioQuestion = {
  question: string;
  whatStrongAnswerShows: string;
};

type CaseStudioOutput = {
  title: string;
  roleSummary: string;
  companyContext: string;
  businessGoal: string;
  scenarioBrief: string;
  constraints: string[];
  deliverables: string[];
  executionPlan: string[];
  evaluationCriteria: string[];
  presentationChecklist: string[];
  portfolioProof: string[];
  mockInterviewQuestions: CaseStudioQuestion[];
};

const rolePresets = [
  {
    label: "AI automation",
    targetRole: "AI Automation Analyst",
    interviewType: "PROJECT_MANAGEMENT",
    seniority: "MID",
    industry: "Technology",
    scenarioFocus: "workflow automation across support, sales ops, or back-office approvals",
    companyContext: "India-first SaaS team scaling quickly with manual operational bottlenecks",
  },
  {
    label: "Growth marketing",
    targetRole: "Growth Marketing Manager",
    interviewType: "MARKETING",
    seniority: "MID",
    industry: "E-commerce / Retail",
    scenarioFocus: "campaign performance, funnel improvement, and channel mix decisions",
    companyContext: "Consumer internet business under pressure to improve CAC efficiency",
  },
  {
    label: "Product",
    targetRole: "Product Manager",
    interviewType: "PRODUCT",
    seniority: "MID",
    industry: "Technology",
    scenarioFocus: "feature prioritization, tradeoffs, and KPI definition",
    companyContext: "B2B product team balancing enterprise requests with roadmap focus",
  },
  {
    label: "Customer success",
    targetRole: "Customer Success Manager",
    interviewType: "CUSTOMER_SUCCESS",
    seniority: "MID",
    industry: "Consulting",
    scenarioFocus: "renewal risk, escalation handling, and retention strategy",
    companyContext: "Mid-market account team trying to reduce churn in a strategic portfolio",
  },
];

const seniorityOptions = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
const toolTypes = INTERVIEW_TYPES.filter((type) => type.value !== "GENERAL");

function serializeStudio(studio: CaseStudioOutput) {
  return [
    studio.title,
    "",
    `Role summary: ${studio.roleSummary}`,
    `Company context: ${studio.companyContext}`,
    `Business goal: ${studio.businessGoal}`,
    "",
    "Scenario brief:",
    studio.scenarioBrief,
    "",
    "Constraints:",
    ...studio.constraints.map((item) => `- ${item}`),
    "",
    "Deliverables:",
    ...studio.deliverables.map((item) => `- ${item}`),
    "",
    "Execution plan:",
    ...studio.executionPlan.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Evaluation criteria:",
    ...studio.evaluationCriteria.map((item) => `- ${item}`),
    "",
    "Presentation checklist:",
    ...studio.presentationChecklist.map((item) => `- ${item}`),
    "",
    "Portfolio proof:",
    ...studio.portfolioProof.map((item) => `- ${item}`),
    "",
    "Mock interview questions:",
    ...studio.mockInterviewQuestions.map(
      (item, index) => `${index + 1}. ${item.question}\n   Strong answer shows: ${item.whatStrongAnswerShows}`
    ),
  ].join("\n");
}

export default function CaseStudioTool() {
  const [form, setForm] = useState({
    targetRole: "AI Automation Analyst",
    interviewType: "PROJECT_MANAGEMENT",
    seniority: "MID",
    industry: "Technology",
    scenarioFocus: "workflow automation across support, sales ops, or back-office approvals",
    companyContext: "India-first SaaS team scaling quickly with manual operational bottlenecks",
  });
  const [studio, setStudio] = useState<CaseStudioOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/candidate/case-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate case studio output");
      }
      setStudio(data.studio);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate case studio output");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="case-studio" className="rounded-[32px] border border-gray-200 bg-white/85 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.28)] backdrop-blur-sm sm:p-8">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Case studio</p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">Generate a real role-specific case, not a generic prompt</h2>
          <p className="mt-3 text-sm leading-6 text-gray-500">
            Build a realistic brief for product, marketing, sales, customer success, finance, HR, project management, or automation roles.
            The result includes deliverables, evaluation criteria, presentation guidance, and interview questions tied to the case.
          </p>
        </div>
        {studio && <CopyTextButton value={serializeStudio(studio)} />}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {rolePresets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setForm(preset);
              setStudio(null);
              setError("");
            }}
            className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:bg-white"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Target role</label>
            <input
              value={form.targetRole}
              onChange={(e) => setForm((current) => ({ ...current, targetRole: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
              placeholder="e.g. AI Automation Analyst, Product Manager, SDR, Finance Analyst"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Interview type</label>
              <select
                value={form.interviewType}
                onChange={(e) => setForm((current) => ({ ...current, interviewType: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
              >
                {toolTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Seniority</label>
              <select
                value={form.seniority}
                onChange={(e) => setForm((current) => ({ ...current, seniority: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
              >
                {seniorityOptions.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Industry</label>
            <select
              value={form.industry}
              onChange={(e) => setForm((current) => ({ ...current, industry: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Scenario focus</label>
            <textarea
              value={form.scenarioFocus}
              onChange={(e) => setForm((current) => ({ ...current, scenarioFocus: e.target.value }))}
              className="mt-2 min-h-[96px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
              placeholder="e.g. funnel conversion, onboarding delays, churn risk, prioritization tradeoffs, automation rollout"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Company context</label>
            <textarea
              value={form.companyContext}
              onChange={(e) => setForm((current) => ({ ...current, companyContext: e.target.value }))}
              className="mt-2 min-h-[110px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:border-saffron"
              placeholder="Describe the kind of company, market, pressure, or operating context you want the case to feel like."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating case..." : "Generate case"}
          </button>
        </form>

        <div className="rounded-[28px] border border-gray-200 bg-[#FAFAF8] p-5 sm:p-6">
          {!studio && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">What you get back</h3>
              <ul className="space-y-3">
                {[
                  "A realistic company-style brief tied to the role you want",
                  "Clear deliverables and an execution plan you can actually present",
                  "Evaluation criteria that mirror what hiring teams look for",
                  "Portfolio-proof bullets and interview questions linked to the brief",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-6 text-gray-500">
                This is the missing bridge between &quot;I studied&quot; and &quot;I can show how I would handle the work.&quot;
              </p>
            </div>
          )}

          {studio && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Case brief</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">{studio.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{studio.roleSummary}</p>
                <p className="mt-4 text-sm leading-7 text-gray-600">{studio.scenarioBrief}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Business goal</p>
                  <p className="mt-3 text-sm leading-7 text-gray-700">{studio.businessGoal}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Company context</p>
                  <p className="mt-2 text-sm leading-7 text-gray-600">{studio.companyContext}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Constraints</p>
                  <ul className="mt-3 space-y-2">
                    {studio.constraints.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-india-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Deliverables</p>
                  <ul className="mt-3 space-y-2">
                    {studio.deliverables.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Evaluation criteria</p>
                  <ul className="mt-3 space-y-2">
                    {studio.evaluationCriteria.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-india-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Execution plan</p>
                <ol className="mt-3 space-y-3">
                  {studio.executionPlan.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-gray-600">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Presentation checklist</p>
                  <ul className="mt-3 space-y-2">
                    {studio.presentationChecklist.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Portfolio proof</p>
                  <ul className="mt-3 space-y-2">
                    {studio.portfolioProof.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-india-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Mock questions tied to this case</p>
                    <h4 className="mt-2 text-lg font-semibold text-gray-900">Use these in an AI mock or recruiter prep</h4>
                  </div>
                  <Link href="/candidate/career-kit" className="text-sm font-semibold text-gray-900 hover:text-saffron">
                    Turn into proof
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {studio.mockInterviewQuestions.map((item) => (
                    <div key={item.question} className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{item.question}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">{item.whatStrongAnswerShows}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
