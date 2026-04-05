"use client";

import Link from "next/link";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

const proofCards = [
  {
    title: "Verified interview reports",
    description:
      "Show scored performance from real sessions instead of asking recruiters to trust generic claims.",
    accent: "from-saffron/20 to-orange-500/10 border-saffron/20",
  },
  {
    title: "Public talent profiles",
    description:
      "Bundle your strongest sessions into one link that stays useful beyond a single application cycle.",
    accent: "from-blue-500/15 to-cyan-500/10 border-blue-500/20",
  },
  {
    title: "Signals that compound",
    description:
      "Badges, streaks, patterns, and live session history create a readiness trail that improves over time.",
    accent: "from-india-green/15 to-emerald-500/10 border-india-green/20",
  },
];

const stackItems = [
  {
    eyebrow: "Train",
    title: "Practice with direction",
    detail: "Use patterns, AI hints, and targeted drills instead of random problem hopping.",
  },
  {
    eyebrow: "Test",
    title: "Validate under pressure",
    detail: "Schedule live interviews and see how your performance changes when the clock is real.",
  },
  {
    eyebrow: "Prove",
    title: "Share verified evidence",
    detail: "Turn strong sessions into reports, badges, and a public talent profile recruiters can review quickly.",
  },
  {
    eyebrow: "Apply",
    title: "Move directly into opportunities",
    detail: "Carry the same proof stack into the job board and recruiter conversations without rebuilding it.",
  },
];

export default function VerifiedOutcomesSection() {
  return (
    <section className="relative bg-[#FAFAF8] py-32 lg:py-40">
      <div className="gradient-orb h-[560px] w-[560px] bg-saffron/10 -top-24 right-0" />
      <div className="gradient-orb h-[520px] w-[520px] bg-india-green/10 bottom-0 -left-24" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <ScrollReveal>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-gray-400">Verified outcomes</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Practice is private.
              <br />
              Proof should not be.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
              The strongest part of Intervue is not another content library. It is the proof layer:
              real interview performance, public talent profiles, and recruiter-ready artifacts that are
              much harder to fake than a polished resume.
            </p>

            <div className="mt-8 space-y-4">
              {proofCards.map((card) => (
                <div
                  key={card.title}
                  className={`rounded-3xl border bg-gradient-to-r ${card.accent} from-white/70 p-5 backdrop-blur-sm`}
                >
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{card.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signup?role=candidate" className="pill-cta-primary">
                Build your proof stack
              </Link>
              <Link href="/careers" className="pill-cta-secondary">
                See the job board
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} direction="right">
            <div className="rounded-[32px] border border-gray-100 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
              <div className="rounded-[28px] bg-gray-950 p-6 sm:p-8">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500">Candidate launch loop</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">From reps to recruiter signal</h3>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
                    One system
                  </div>
                </div>

                <StaggerContainer className="mt-6 grid gap-4" staggerDelay={0.08}>
                  {stackItems.map((item, index) => (
                    <StaggerItem key={item.title}>
                      <div className="grid grid-cols-[auto_1fr] gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron to-india-green text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                            {item.eyebrow}
                          </p>
                          <h4 className="mt-1 text-lg font-semibold text-white">{item.title}</h4>
                          <p className="mt-2 text-sm leading-6 text-gray-400">{item.detail}</p>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>

                <div className="mt-6 grid gap-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:grid-cols-3">
                  {[
                    { value: "Reports", detail: "share session-by-session performance" },
                    { value: "Profile", detail: "collect your best signals in one place" },
                    { value: "Jobs", detail: "move from proof into real openings" },
                  ].map((item) => (
                    <div key={item.value} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4">
                      <p className="text-lg font-semibold text-white">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-gray-500">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
