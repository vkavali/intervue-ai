"use client";

import Link from "next/link";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

const roleCards = [
  {
    title: "AI Automation Analyst",
    detail: "Map repetitive workflows, define handoffs, and turn operating pain into automations teams can trust.",
  },
  {
    title: "Ops Automation Specialist",
    detail: "Build automations for support, finance ops, onboarding, and back-office tasks without waiting on a full engineering sprint.",
  },
  {
    title: "Workflow Integration Associate",
    detail: "Connect forms, sheets, CRMs, helpdesks, and APIs so teams stop doing the same manual steps every day.",
  },
  {
    title: "GTM Automation Builder",
    detail: "Automate lead routing, follow-up, CRM hygiene, reporting, and campaign handoffs for growth teams.",
  },
];

const industrySignals = [
  "Bengaluru SaaS",
  "Mumbai fintech",
  "Gurugram GCCs",
  "Hyderabad product teams",
  "Pune IT services",
  "Chennai operations",
];

const toolStack = [
  "ChatGPT and Claude",
  "Gemini and Google Workspace",
  "Zapier, Make, and n8n",
  "Sheets, Forms, and dashboards",
  "APIs, webhooks, and CRM sync",
  "Zoho, Freshworks, Razorpay, and WhatsApp flows",
];

const sprintCards = [
  {
    eyebrow: "Sprint 1",
    title: "Find automation opportunities",
    detail: "Learn where teams in India lose time: support queues, finance ops, lead routing, reporting, and approvals.",
  },
  {
    eyebrow: "Sprint 2",
    title: "Prompting with business discipline",
    detail: "Use AI for extraction, summarization, drafting, triage, and structured outputs that can plug into real workflows.",
  },
  {
    eyebrow: "Sprint 3",
    title: "Build no-code and low-code flows",
    detail: "Connect forms, sheets, inboxes, CRMs, and notification channels into reliable automations with clear fallbacks.",
  },
  {
    eyebrow: "Sprint 4",
    title: "Add API and webhook thinking",
    detail: "Move from simple triggers to system-aware flows that can read events, transform payloads, and update business tools.",
  },
  {
    eyebrow: "Sprint 5",
    title: "Practice agent and approval patterns",
    detail: "Design automations that escalate, request confirmation, and keep humans in the loop instead of blindly executing.",
  },
  {
    eyebrow: "Sprint 6",
    title: "Prove it in interviews",
    detail: "Use Intervue mock interviews, AI briefs, and recruiter-facing assets to turn project work into hiring signal.",
  },
];

const outcomeCards = [
  {
    title: "Practice on real business cases",
    detail: "Train on automations for WhatsApp support, collections reminders, lead routing, onboarding checklists, and reporting loops.",
  },
  {
    title: "Get AI feedback that is actually useful",
    detail: "Use learning briefs, weakness-based recommendations, and AI coaching to sharpen how you think and explain tradeoffs.",
  },
  {
    title: "Leave with recruiter-ready proof",
    detail: "Generate a career kit, run live interviews, and share verified reports instead of relying on vague course completion claims.",
  },
];

const indiaCases = [
  "Route Meta Ads and website leads into the right CRM queue with follow-up logic.",
  "Automate customer support triage across email, forms, and WhatsApp escalations.",
  "Build a collections or payment reminder workflow tied to approvals and Razorpay events.",
  "Create onboarding flows for vendors, candidates, or customers with checklist automation.",
];

export default function IndiaAIAutomationSection({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  return (
    <section className={standalone ? "relative overflow-hidden bg-[#FAFAF8] py-24 sm:py-28" : "relative overflow-hidden bg-white py-28 lg:py-36"}>
      <div className="gradient-orb h-[560px] w-[560px] bg-saffron/10 -top-24 left-0" />
      <div className="gradient-orb h-[520px] w-[520px] bg-india-green/10 bottom-0 right-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-gray-400">India AI automation</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Build AI automation skills for
            <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent"> India&apos;s real workflows</span>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-500 sm:text-lg">
            TripleTen sells an AI automation future. Intervue can win in India by making that future
            interviewable: business-case practice, mock interviews, AI coaching, and proof that works
            for SaaS, fintech, GCC, support, and operations roles.
          </p>
        </ScrollReveal>

        <div className="mt-8 flex flex-wrap gap-2">
          {industrySignals.map((item) => (
            <span
              key={item}
              className="rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-600 backdrop-blur-sm"
            >
              {item}
            </span>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <ScrollReveal>
            <div className="rounded-[32px] border border-gray-200 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Career outcomes</p>
                  <h3 className="mt-2 text-2xl font-semibold text-gray-900">Roles this page should help you win</h3>
                </div>
                <span className="rounded-full border border-saffron/20 bg-saffron/10 px-3 py-1 text-xs font-medium text-saffron">
                  India-first
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {roleCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-gray-200 bg-gray-50/80 p-5">
                    <h4 className="text-lg font-semibold text-gray-900">{card.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{card.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-3xl border border-gray-200 bg-gradient-to-r from-saffron/5 to-india-green/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Tool stack recruiters expect you to understand</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {toolStack.map((item) => (
                    <div key={item} className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08} direction="right">
            <div className="rounded-[32px] bg-gray-950 p-6 text-white shadow-[0_28px_90px_-36px_rgba(15,23,42,0.6)] sm:p-8">
              <div className="border-b border-white/10 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Intervue track</p>
                <h3 className="mt-2 text-2xl font-semibold">From workflow thinking to hiring proof</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  This is not a generic bootcamp promise. It is a tighter loop: learn the workflow,
                  practice the scenario, explain the tradeoffs, and prove it in interviews.
                </p>
              </div>

              <StaggerContainer className="mt-6 grid gap-4" staggerDelay={0.07}>
                {sprintCards.map((card, index) => (
                  <StaggerItem key={card.title}>
                    <div className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron to-india-green text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">{card.eyebrow}</p>
                        <h4 className="mt-1 text-lg font-semibold text-white">{card.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{card.detail}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <ScrollReveal>
            <div className="rounded-[32px] border border-gray-200 bg-white/85 p-6 backdrop-blur-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">India-specific practice cases</p>
              <h3 className="mt-2 text-2xl font-semibold text-gray-900">Train on workflows Indian teams actually use</h3>
              <ul className="mt-5 space-y-3">
                {indiaCases.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.06} direction="right">
            <div className="rounded-[32px] border border-gray-200 bg-white/85 p-6 backdrop-blur-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">What makes Intervue stronger</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {outcomeCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-gray-200 bg-gray-50/80 p-5">
                    <h4 className="text-lg font-semibold text-gray-900">{card.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{card.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/practice?tab=generate" className="pill-cta-primary">
                  Start AI automation practice
                </Link>
                <Link href="/candidate/career-kit" className="pill-cta-secondary">
                  Open career kit
                </Link>
                <Link href="/india/project-sprints" className="pill-cta-secondary">
                  Explore project sprints
                </Link>
              </div>

              {!standalone && (
                <Link
                  href="/india/ai-automation"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 transition-colors hover:text-saffron"
                >
                  Explore the full India automation page
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
