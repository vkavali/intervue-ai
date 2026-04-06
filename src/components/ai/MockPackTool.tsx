"use client";

import { useState } from "react";
import Link from "next/link";
import { INDUSTRIES, INTERVIEW_TYPES } from "@/data/interview-types";
import CopyTextButton from "@/components/ai/CopyTextButton";

type MockPackQuestion = {
  question: string;
  whatTheyTest: string;
  strongAnswerShape: string;
  followUp: string;
};

type MockPackOutput = {
  title: string;
  positioning: string;
  openingPitch: string;
  storiesToPrepare: string[];
  questions: MockPackQuestion[];
  scorecardSignals: string[];
  redFlags: string[];
  prepChecklist: string[];
  closingPitch: string;
};

const presets = [
  {
    label: "SDR / sales",
    targetRole: "Sales Development Representative",
    interviewType: "SALES",
    seniority: "JUNIOR",
    industry: "Technology",
    focusAreas: "discovery, objection handling, call structure, and follow-up discipline",
    companyContext: "B2B SaaS team selling to mid-market revenue leaders",
  },
  {
    label: "Product",
    targetRole: "Product Manager",
    interviewType: "PRODUCT",
    seniority: "MID",
    industry: "Technology",
    focusAreas: "product sense, prioritization, KPI choices, and stakeholder tradeoffs",
    companyContext: "Platform team balancing enterprise asks with long-term product direction",
  },
  {
    label: "Marketing",
    targetRole: "Growth Marketing Manager",
    interviewType: "MARKETING",
    seniority: "MID",
    industry: "E-commerce / Retail",
    focusAreas: "channel mix, funnel analysis, campaign diagnosis, and experimentation quality",
    companyContext: "Consumer growth team under pressure to improve efficiency without stalling growth",
  },
  {
    label: "AI automation",
    targetRole: "AI Automation Analyst",
    interviewType: "PROJECT_MANAGEMENT",
    seniority: "MID",
    industry: "Technology",
    focusAreas: "workflow mapping, automation tradeoffs, stakeholder communication, and rollout risks",
    companyContext: "Operations team trying to remove manual handoffs without breaking reliability",
  },
];

const seniorityOptions = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
const toolTypes = INTERVIEW_TYPES.filter((type) => type.value !== "GENERAL");

function serializePack(pack: MockPackOutput) {
  return [
    pack.title,
    "",
    "Positioning:",
    pack.positioning,
    "",
    "Opening pitch:",
    pack.openingPitch,
    "",
    "Stories to prepare:",
    ...pack.storiesToPrepare.map((item) => `- ${item}`),
    "",
    "Questions:",
    ...pack.questions.map(
      (item, index) =>
        `${index + 1}. ${item.question}\n   They test: ${item.whatTheyTest}\n   Strong answer: ${item.strongAnswerShape}\n   Follow-up: ${item.followUp}`
    ),
    "",
    "Scorecard signals:",
    ...pack.scorecardSignals.map((item) => `- ${item}`),
    "",
    "Red flags:",
    ...pack.redFlags.map((item) => `- ${item}`),
    "",
    "Prep checklist:",
    ...pack.prepChecklist.map((item) => `- ${item}`),
    "",
    "Closing pitch:",
    pack.closingPitch,
  ].join("\n");
}

export default function MockPackTool() {
  const [form, setForm] = useState({
    targetRole: "Product Manager",
    interviewType: "PRODUCT",
    seniority: "MID",
    industry: "Technology",
    focusAreas: "product sense, prioritization, KPI choices, and stakeholder tradeoffs",
    companyContext: "Platform team balancing enterprise asks with long-term product direction",
  });
  const [pack, setPack] = useState<MockPackOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/candidate/mock-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate mock pack");
      }
      setPack(data.pack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate mock pack");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="mock-pack" className="rounded-[32px] border border-gray-200 bg-gray-950 p-6 text-white shadow-[0_28px_90px_-40px_rgba(15,23,42,0.55)] sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Mock pack</p>
          <h2 className="mt-2 text-2xl font-semibold">Build a role-specific mock interview pack</h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Generate the opening pitch, the stories you need ready, the questions you are likely to get,
            what each question is testing, and the checklist to clean up before your next mock.
          </p>
        </div>
        {pack && <CopyTextButton value={serializePack(pack)} className="border-white/15 bg-white/5 text-gray-200 hover:bg-white/10" />}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setForm(preset);
              setPack(null);
              setError("");
            }}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/10"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.88fr_1.12fr]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Target role</label>
            <input
              value={form.targetRole}
              onChange={(e) => setForm((current) => ({ ...current, targetRole: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-saffron"
              placeholder="e.g. SDR, Product Manager, Growth Marketer, AI Automation Analyst"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Interview type</label>
              <select
                value={form.interviewType}
                onChange={(e) => setForm((current) => ({ ...current, interviewType: e.target.value }))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-saffron"
              >
                {toolTypes.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-900">
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
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-saffron"
              >
                {seniorityOptions.map((level) => (
                  <option key={level} value={level} className="text-gray-900">
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
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-saffron"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry} className="text-gray-900">
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Focus areas</label>
            <textarea
              value={form.focusAreas}
              onChange={(e) => setForm((current) => ({ ...current, focusAreas: e.target.value }))}
              className="mt-2 min-h-[96px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-saffron"
              placeholder="e.g. objection handling, prioritization, analytics, stakeholder alignment, execution risk"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Company context</label>
            <textarea
              value={form.companyContext}
              onChange={(e) => setForm((current) => ({ ...current, companyContext: e.target.value }))}
              className="mt-2 min-h-[110px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-saffron"
              placeholder="Describe the kind of company, market pressure, team setup, or customer segment you want the mock to reflect."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating mock pack..." : "Generate mock pack"}
          </button>
        </form>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 sm:p-6">
          {!pack && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What this tool gives you</h3>
              <ul className="space-y-3">
                {[
                  "A first answer for \"tell me about yourself\" tuned to the target role",
                  "The strongest stories you should have ready before the interview",
                  "Role-specific questions with the answer shape and likely follow-up",
                  "A recruiter-style scorecard, common red flags, and a prep checklist",
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-gray-300">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-sm leading-6 text-gray-400">
                Use it before a mock interview, before talking to a recruiter, or before packaging the story in your career kit.
              </p>
            </div>
          )}

          {pack && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Interview positioning</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{pack.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-300">{pack.positioning}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Opening pitch</p>
                  <p className="mt-3 text-sm leading-7 text-gray-200">{pack.openingPitch}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Closing pitch</p>
                  <p className="mt-3 text-sm leading-7 text-gray-200">{pack.closingPitch}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Stories to prepare</p>
                  <ul className="mt-3 space-y-2">
                    {pack.storiesToPrepare.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Scorecard signals</p>
                  <ul className="mt-3 space-y-2">
                    {pack.scorecardSignals.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-india-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Mock questions</p>
                    <h4 className="mt-2 text-lg font-semibold text-white">Questions, answer shape, and follow-ups</h4>
                  </div>
                  <Link href="/candidate/career-kit" className="text-sm font-semibold text-white hover:text-saffron">
                    Use in career kit
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {pack.questions.map((item) => (
                    <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                      <p className="text-sm font-semibold text-white">{item.question}</p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        <span className="font-medium text-white">What they test:</span> {item.whatTheyTest}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        <span className="font-medium text-white">Strong answer:</span> {item.strongAnswerShape}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-300">
                        <span className="font-medium text-white">Follow-up:</span> {item.followUp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Red flags</p>
                  <ul className="mt-3 space-y-2">
                    {pack.redFlags.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Prep checklist</p>
                  <ul className="mt-3 space-y-2">
                    {pack.prepChecklist.map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-gray-300">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
