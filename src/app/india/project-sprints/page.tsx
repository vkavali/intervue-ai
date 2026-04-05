import type { Metadata } from "next";
import Link from "next/link";
import IndiaProjectSprintsSection from "@/components/home/IndiaProjectSprintsSection";

export const metadata: Metadata = {
  title: "Project Sprints India | printf",
  description:
    "Explore Intervue's India-first project sprint model for real briefs, live demos, portfolio proof, and interview-ready outcomes.",
};

export default function IndiaProjectSprintsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
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
      <IndiaProjectSprintsSection standalone />
    </div>
  );
}
