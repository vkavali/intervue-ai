"use client";

import Link from "next/link";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/ScrollReveal";

const capabilityCards = [
  {
    title: "Available 24/7",
    description: "Hints, guidance, and summaries are available whenever someone is practicing, not just during scheduled office hours.",
  },
  {
    title: "Explains theory",
    description: "AI editorials and learning briefs translate patterns, tradeoffs, and complexity into plain English.",
  },
  {
    title: "Reviews coding tasks",
    description: "Submission coaching scores the work, highlights what went well, and calls out what to fix next.",
  },
  {
    title: "Explains likely errors",
    description: "Learning briefs diagnose probable failure modes when tests are partially passing or time is running long.",
  },
  {
    title: "Summarizes content",
    description: "Candidates can now generate concise study summaries instead of rereading every note, report, or editorial.",
  },
  {
    title: "Generates workflows",
    description: "Teams can use AI to generate interview templates and question sets, not just candidate-facing support.",
  },
];

export default function AICapabilitiesSection() {
  return (
    <section className="relative bg-white py-32 lg:py-40">
      <div className="gradient-orb h-[560px] w-[560px] bg-saffron/10 -top-28 left-0" />
      <div className="gradient-orb h-[500px] w-[500px] bg-india-green/10 bottom-0 right-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mb-20 lg:mb-24 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-gray-400">AI coach</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            AI should do more than chat.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            TripleTen makes its AI visible. Intervue now does the same, but in our own product model:
            interview prep, code review, summaries, recommendations, and workflow generation for teams.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" staggerDelay={0.06}>
          {capabilityCards.map((card) => (
            <StaggerItem key={card.title}>
              <div className="rounded-[28px] border border-gray-200 bg-[#FAFAF8] p-6 h-full">
                <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-500">{card.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal className="mt-12 text-center">
          <Link href="/ai-tools" className="pill-cta-primary">
            Explore AI tools
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
