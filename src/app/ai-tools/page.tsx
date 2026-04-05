import type { Metadata } from "next";
import Link from "next/link";
import AIToolsHub from "@/components/ai/AIToolsHub";

export const metadata: Metadata = {
  title: "AI Tools | printf",
  description:
    "Explore Intervue's AI capabilities for hints, theory explanations, code review, learning summaries, and AI-generated hiring workflows.",
};

export default function AIToolsPage() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>
      <AIToolsHub />
    </>
  );
}
