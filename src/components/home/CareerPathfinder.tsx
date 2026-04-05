"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";

type Persona = "candidate" | "company" | "school";
type Pace = "sprint" | "steady" | "cohort";

type FocusOption = {
  id: string;
  label: string;
  helper: string;
};

type Recommendation = {
  title: string;
  summary: string;
  supportLabel: string;
  supportItems: string[];
  steps: string[];
  proofPoints: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

const paceOptions: Array<{ id: Pace; label: string; helper: string }> = [
  { id: "sprint", label: "Sprint", helper: "Tight focus, fast feedback, short timeline" },
  { id: "steady", label: "Weekly rhythm", helper: "Consistent progress around work or school" },
  { id: "cohort", label: "Structured rollout", helper: "A repeatable system for teams and batches" },
];

const personaConfig: Record<
  Persona,
  {
    label: string;
    eyebrow: string;
    title: string;
    description: string;
    focuses: FocusOption[];
  }
> = {
  candidate: {
    label: "Candidates",
    eyebrow: "Career Pathfinder",
    title: "Find your shortest path to a stronger application",
    description:
      "Start with the goal that matters most and Intervue maps you to the right mix of practice, live interviews, proof, and job discovery.",
    focuses: [
      { id: "land-interviews", label: "Land interviews faster", helper: "Sharpen fundamentals and get interview ready" },
      { id: "prove-skills", label: "Show proof, not promises", helper: "Turn strong sessions into recruiter-facing evidence" },
      { id: "switch-track", label: "Switch into a new role", helper: "Use role-specific practice and guided validation" },
    ],
  },
  company: {
    label: "Companies",
    eyebrow: "Hiring Pathfinder",
    title: "Map your hiring flow before you add another tool",
    description:
      "Use the pathfinder to decide whether you need faster screening, tighter evaluation, or a broader hiring stack across multiple departments.",
    focuses: [
      { id: "screen-faster", label: "Screen faster", helper: "Reduce time from intake to shortlist" },
      { id: "standardize", label: "Standardize scoring", helper: "Make every interviewer evaluate the same way" },
      { id: "multi-role", label: "Expand beyond engineering", helper: "Run one process across product, sales, marketing, and more" },
    ],
  },
  school: {
    label: "Schools",
    eyebrow: "Placement Pathfinder",
    title: "Turn interview prep into a repeatable placement system",
    description:
      "Align assignments, live interviews, and measurable readiness so students leave with stronger signals than a resume alone.",
    focuses: [
      { id: "placements", label: "Raise placement readiness", helper: "Move students from practice to interview confidence" },
      { id: "cohorts", label: "Run cohorts cleanly", helper: "Enroll, assign, track, and review at batch scale" },
      { id: "visibility", label: "Give students shareable proof", helper: "Help students build public evidence of readiness" },
    ],
  },
};

const recommendationMap: Record<Persona, Record<string, Recommendation>> = {
  candidate: {
    "land-interviews": {
      title: "Interview Sprint",
      summary:
        "Use pattern-based practice, timed sessions, and live mock interviews to get from rusty to interview ready without guessing what to study next.",
      supportLabel: "Best when you need",
      supportItems: ["guided practice", "AI feedback", "live scheduling", "job discovery"],
      steps: [
        "Warm up with pattern-based practice and AI hints in Practice Mode.",
        "Book a live interview slot to pressure-test timing and communication.",
        "Review the audit report to tighten weak spots before the next round.",
        "Apply through the job board once your performance is consistent.",
      ],
      proofPoints: ["4,000+ practice problems", "live interview scheduling", "shareable audit reports"],
      primaryCta: { label: "Start practicing", href: "/practice" },
      secondaryCta: { label: "Browse jobs", href: "/careers" },
    },
    "prove-skills": {
      title: "Proof Stack",
      summary:
        "Replace vague self-assessment with verified interview performance, a public talent profile, and shareable artifacts recruiters can evaluate quickly.",
      supportLabel: "Best when you need",
      supportItems: ["shareable evidence", "public profile", "verified badges", "job applications"],
      steps: [
        "Run targeted mock interviews for the role you want.",
        "Share the strongest audit reports and badge-worthy results.",
        "Turn those sessions into a public talent profile.",
        "Use the same proof package when you apply to open roles.",
      ],
      proofPoints: ["public talent profile", "shared report links", "verified interview badges"],
      primaryCta: { label: "Build your profile", href: "/auth/signup?role=candidate" },
      secondaryCta: { label: "Browse jobs", href: "/careers" },
    },
    "switch-track": {
      title: "Role Switch Blueprint",
      summary:
        "Move into a new function with role-specific prompts, real interview reps, and evidence that shows you can perform in the new lane.",
      supportLabel: "Best when you need",
      supportItems: ["role-specific scenarios", "timed practice", "report reviews", "public proof"],
      steps: [
        "Pick the role you want and practice against its interview format.",
        "Use AI feedback to close obvious skill and communication gaps.",
        "Schedule live sessions to validate performance under pressure.",
        "Package your strongest results into a profile and apply with context.",
      ],
      proofPoints: ["multi-role practice", "role-specific scoring", "shareable recruiter proof"],
      primaryCta: { label: "Take the first session", href: "/auth/signup?role=candidate" },
      secondaryCta: { label: "Explore open roles", href: "/careers" },
    },
  },
  company: {
    "screen-faster": {
      title: "Fast Shortlist Setup",
      summary:
        "Use AI-controlled interviews, live scheduling, and instant scorecards to collapse first-round coordination and speed up shortlisting.",
      supportLabel: "Best when you need",
      supportItems: ["live scheduling", "faster screening", "instant scorecards", "candidate comparison"],
      steps: [
        "Create the role and choose the interview format that matches it.",
        "Schedule live sessions without juggling external tools.",
        "Let AI generate structured audit reports after every session.",
        "Compare candidates side by side and move finalists forward.",
      ],
      proofPoints: ["calendar scheduling", "audit reports", "candidate comparison"],
      primaryCta: { label: "Start hiring", href: "/auth/signup?role=company" },
      secondaryCta: { label: "See platform features", href: "/#features" },
    },
    standardize: {
      title: "Structured Evaluation Rollout",
      summary:
        "Make every interviewer work from the same rubric, control AI exposure per round, and keep an audit trail for every hiring decision.",
      supportLabel: "Best when you need",
      supportItems: ["shared rubrics", "AI controls", "audit trail", "decision confidence"],
      steps: [
        "Define round-by-round expectations and AI levels up front.",
        "Run interviews inside the same controlled environment every time.",
        "Review consistent reports instead of fragmented notes.",
        "Use the pipeline and comparison tools to defend final decisions.",
      ],
      proofPoints: ["5 AI levels", "role-specific scoring", "pipeline history"],
      primaryCta: { label: "Standardize interviews", href: "/auth/signup?role=company" },
      secondaryCta: { label: "Review pricing", href: "/#pricing" },
    },
    "multi-role": {
      title: "Multi-Role Hiring Stack",
      summary:
        "Run engineering, sales, marketing, product, and behavioral interviews on one system instead of stitching together separate tools.",
      supportLabel: "Best when you need",
      supportItems: ["one stack", "multi-role templates", "shared pipeline", "central analytics"],
      steps: [
        "Launch role-specific templates for each department.",
        "Keep live interviews, scoring, and scheduling inside one workspace.",
        "Give each team tailored rubrics without breaking process consistency.",
        "Track every candidate from screening to final round in one pipeline.",
      ],
      proofPoints: ["multi-role interview formats", "shared dashboards", "department-aware workflows"],
      primaryCta: { label: "Launch one system", href: "/auth/signup?role=company" },
      secondaryCta: { label: "See supported roles", href: "/#features" },
    },
  },
  school: {
    placements: {
      title: "Placement Readiness Loop",
      summary:
        "Blend practice assignments, mock interviews, and measurable performance so students reach real interviews with better signal and confidence.",
      supportLabel: "Best when you need",
      supportItems: ["guided prep", "mock interviews", "readiness analytics", "shareable proof"],
      steps: [
        "Enroll students into a common readiness track.",
        "Assign pattern-based practice and role-relevant drills.",
        "Run live interview sessions to validate progress.",
        "Use reports and shared profiles as placement proof points.",
      ],
      proofPoints: ["assignment workflows", "shared reports", "placement signals"],
      primaryCta: { label: "Set up your cohort", href: "/auth/signup?role=school" },
      secondaryCta: { label: "See school mode", href: "/#schools" },
    },
    cohorts: {
      title: "Cohort Control Panel",
      summary:
        "Enroll large batches, assign work in waves, and measure readiness through live performance instead of only problem counts.",
      supportLabel: "Best when you need",
      supportItems: ["batch enrollment", "assignment control", "analytics", "consistent evaluation"],
      steps: [
        "Create a batch and distribute a single enrollment code.",
        "Assign modules by pattern, difficulty, or deadline.",
        "Track activity, progress, and readiness in one place.",
        "Use live interviews to validate top candidates before placements.",
      ],
      proofPoints: ["enrollment codes", "class analytics", "interview validation"],
      primaryCta: { label: "Launch your batch", href: "/auth/signup?role=school" },
      secondaryCta: { label: "See school mode", href: "/#schools" },
    },
    visibility: {
      title: "Student Proof Layer",
      summary:
        "Give students more than a certificate by helping them leave with public profiles, shared reports, and validated interview outcomes.",
      supportLabel: "Best when you need",
      supportItems: ["public proof", "verified reports", "role targeting", "placement support"],
      steps: [
        "Run students through targeted mock interviews.",
        "Identify their strongest performance and shared-report candidates.",
        "Turn those results into recruiter-facing talent profiles.",
        "Use the job board and hiring surfaces to close the loop.",
      ],
      proofPoints: ["public talent profiles", "share tokens", "verified interviews"],
      primaryCta: { label: "Build student proof", href: "/auth/signup?role=school" },
      secondaryCta: { label: "View the job board", href: "/careers" },
    },
  },
};

const paceSummary: Record<
  Pace,
  {
    label: string;
    detail: string;
  }
> = {
  sprint: {
    label: "2-week sprint",
    detail: "Tight loops, immediate feedback, and a short path to decision-making.",
  },
  steady: {
    label: "4-week rhythm",
    detail: "A manageable weekly plan for sustained progress without burnout.",
  },
  cohort: {
    label: "6-week rollout",
    detail: "A repeatable structure that scales across teams, students, or hiring panels.",
  },
};

export default function CareerPathfinder({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [persona, setPersona] = useState<Persona>("candidate");
  const [focus, setFocus] = useState(personaConfig.candidate.focuses[0].id);
  const [pace, setPace] = useState<Pace>("steady");

  useEffect(() => {
    setFocus(personaConfig[persona].focuses[0].id);
  }, [persona]);

  const config = personaConfig[persona];
  const recommendation = recommendationMap[persona][focus];
  const timeline = paceSummary[pace];

  return (
    <section
      className={standalone ? "relative overflow-hidden bg-[#FAFAF8] py-24 sm:py-28" : "relative py-32 lg:py-40 bg-white"}
    >
      <div className="gradient-orb h-[520px] w-[520px] bg-saffron/10 -top-20 -left-24" />
      <div className="gradient-orb h-[460px] w-[460px] bg-india-green/10 bottom-0 right-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-14 max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-gray-400">{config.eyebrow}</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            {config.title}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            {config.description}
          </p>
        </ScrollReveal>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal>
            <div className="rounded-[28px] border border-gray-100 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] backdrop-blur-sm sm:p-8">
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">1. Choose your lane</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {(Object.entries(personaConfig) as Array<[Persona, (typeof personaConfig)[Persona]]>).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPersona(key)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          persona === key
                            ? "border-gray-900 bg-gray-900 text-white shadow-lg"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold">{value.label}</p>
                        <p className={`mt-1 text-xs leading-5 ${persona === key ? "text-gray-300" : "text-gray-400"}`}>
                          {value.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">2. What matters most?</p>
                  <div className="mt-4 grid gap-3">
                    {config.focuses.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFocus(item.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          focus === item.id
                            ? "border-saffron/40 bg-gradient-to-r from-saffron/10 to-india-green/10 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">{item.helper}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">3. Pick your pace</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {paceOptions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPace(item.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                          pace === item.id
                            ? "border-india-green/40 bg-india-green/5"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">{item.helper}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} direction="right">
            <div className="overflow-hidden rounded-[32px] bg-gray-950 shadow-[0_28px_90px_-36px_rgba(15,23,42,0.6)]">
              <div className="border-b border-white/10 px-6 py-5 sm:px-8">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">
                    Recommended path
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-300">
                    {timeline.label}
                  </span>
                </div>
                <h3 className="mt-5 text-3xl font-semibold text-white">{recommendation.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  {recommendation.summary}
                </p>
              </div>

              <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">{recommendation.supportLabel}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {recommendation.supportItems.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-6 text-gray-500">{timeline.detail}</p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-transparent p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">What happens next</p>
                    <span className="text-xs font-medium text-gray-500">4-step flow</span>
                  </div>
                  <ol className="mt-4 space-y-3">
                    {recommendation.steps.map((step, index) => (
                      <li key={step} className="flex gap-3">
                        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-saffron to-india-green text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-6 text-gray-200">{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Signals you unlock</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {recommendation.proofPoints.map((point) => (
                      <div key={point} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-sm font-medium text-white">{point}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={recommendation.primaryCta.href}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100"
                  >
                    {recommendation.primaryCta.label}
                  </Link>
                  <Link
                    href={recommendation.secondaryCta.href}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/5"
                  >
                    {recommendation.secondaryCta.label}
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
