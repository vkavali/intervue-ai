"use client";

import Link from "next/link";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

const sprintTracks = [
  {
    title: "AI Automation Sprint",
    company: "India SaaS Ops",
    challenge: "Design a lead-routing and follow-up workflow that reduces manual triage across forms, CRM, and WhatsApp handoffs.",
    tools: ["Claude", "Zapier", "n8n", "Sheets", "CRM sync"],
    skills: ["workflow mapping", "handoff design", "structured prompts", "demo presentation"],
  },
  {
    title: "Payments Ops Sprint",
    company: "Fintech workflows",
    challenge: "Build a reconciliation and reminder system for failed payments, approval queues, and customer notifications.",
    tools: ["Razorpay events", "webhooks", "Google Sheets", "dashboards"],
    skills: ["event thinking", "ops automation", "risk controls", "stakeholder explanation"],
  },
  {
    title: "QA Release Sprint",
    company: "D2C and ecommerce",
    challenge: "Create a repeatable regression approach for catalogue, checkout, and notification flows before a major release.",
    tools: ["Jira", "Postman", "playbooks", "test cases"],
    skills: ["test design", "bug reporting", "release communication", "quality reasoning"],
  },
  {
    title: "Data and Support Sprint",
    company: "GCC and service teams",
    challenge: "Turn noisy support and operational data into a dashboard that shows bottlenecks, failure reasons, and action priority.",
    tools: ["SQL", "Sheets", "Power BI", "Python"],
    skills: ["analysis", "business framing", "insight storytelling", "decision support"],
  },
];

const processSteps = [
  {
    title: "Pick a real brief",
    detail: "Start from a company-style problem statement instead of an abstract tutorial.",
  },
  {
    title: "Ship in a team rhythm",
    detail: "Work through a defined scope, a clear delivery sequence, and a presentation deadline.",
  },
  {
    title: "Present the work live",
    detail: "Explain tradeoffs, defend decisions, and show what you would improve next.",
  },
  {
    title: "Turn it into hiring proof",
    detail: "Convert the sprint into portfolio bullets, a career kit, and a stronger interview story.",
  },
];

const proofArtifacts = [
  "Project brief and scoped solution summary",
  "Demo-ready walkthrough and presentation notes",
  "Career kit bullets and recruiter outreach copy",
  "Mock interview report tied to the project theme",
];

export default function IndiaProjectSprintsSection({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  return (
    <section className={standalone ? "relative overflow-hidden bg-[#FAFAF8] py-24 sm:py-28" : "relative overflow-hidden bg-white py-28 lg:py-36"}>
      <div className="gradient-orb h-[520px] w-[520px] bg-saffron/10 -top-20 right-0" />
      <div className="gradient-orb h-[500px] w-[500px] bg-india-green/10 bottom-0 -left-20" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="max-w-4xl">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-gray-400">Project sprints</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Work on company-style briefs.
            <span className="bg-gradient-to-r from-saffron to-india-green bg-clip-text text-transparent"> Graduate with proof, not just prep.</span>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-gray-500 sm:text-lg">
            The strongest idea on TripleTen&apos;s externships page is not the label. It is the shift from
            studying alone to solving scoped business problems, presenting the work, and turning that
            experience into portfolio signal. Intervue can own that with project sprints built for India.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal>
            <div className="rounded-[32px] border border-gray-200 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Live brief catalog</p>
                  <h3 className="mt-2 text-2xl font-semibold text-gray-900">Sprints that feel like real work</h3>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                  1-2 week cycles
                </span>
              </div>

              <div className="mt-6 grid gap-4">
                {sprintTracks.map((track) => (
                  <div key={track.title} className="rounded-3xl border border-gray-200 bg-gray-50/80 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-saffron/20 bg-saffron/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
                        {track.company}
                      </span>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold text-gray-900">{track.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{track.challenge}</p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">Tools</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {track.tools.map((item) => (
                            <span key={item} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">Skills</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {track.skills.map((item) => (
                            <span key={item} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08} direction="right">
            <div className="rounded-[32px] bg-gray-950 p-6 text-white shadow-[0_28px_90px_-36px_rgba(15,23,42,0.6)] sm:p-8">
              <div className="border-b border-white/10 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">How it should work in Intervue</p>
                <h3 className="mt-2 text-2xl font-semibold">Brief, build, present, prove</h3>
              </div>

              <StaggerContainer className="mt-6 grid gap-4" staggerDelay={0.07}>
                {processSteps.map((step, index) => (
                  <StaggerItem key={step.title}>
                    <div className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron to-india-green text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{step.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-gray-400">{step.detail}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Artifacts you should leave with</p>
                <ul className="mt-4 space-y-3">
                  {proofArtifacts.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-gray-200">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-10">
          <div className="rounded-[32px] border border-gray-200 bg-white/85 p-6 backdrop-blur-sm sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">Intervue advantage</p>
                <h3 className="mt-2 text-2xl font-semibold text-gray-900">We can connect project work directly to hiring readiness</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Most externship pages stop at the project. Intervue can connect the project sprint to
                  mock interviews, AI learning briefs, recruiter messaging, and the job board. That makes
                  the project useful after the demo day is over.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/practice?tab=generate" className="pill-cta-primary">
                  Open project-style practice
                </Link>
                <Link href="/candidate/career-kit" className="pill-cta-secondary">
                  Build project proof
                </Link>
                <Link href="/india/ai-automation" className="pill-cta-secondary">
                  See automation track
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
