import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  1: { label: "L1 Hint", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  2: { label: "L2 Scaffold", color: "text-india-green bg-india-green/10 border-india-green/30" },
  3: { label: "L3 Guide", color: "text-saffron bg-saffron/10 border-saffron/30" },
  4: { label: "L4 Copilot", color: "text-green-400 bg-green-500/10 border-green-500/30" },
};

const difficultyColors: Record<string, string> = {
  EASY: "text-green-400 bg-green-500/10 border-green-500/30",
  MEDIUM: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  HARD: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default async function InterviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
  });

  const template = await prisma.interviewTemplate.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { orderIndex: "asc" } },
      company: { select: { name: true } },
    },
  });

  if (!template || template.companyId !== user?.companyId) {
    notFound();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/interviews"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              &larr; Back to Templates
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{template.title}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
            <span>{template.role}</span>
            <span className="text-gray-600">&middot;</span>
            <span>{template.seniority}</span>
            <span className="text-gray-600">&middot;</span>
            <span>{template.roundType}</span>
            <span className="text-gray-600">&middot;</span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                aiLevelLabels[template.defaultAiLevel]?.color || ""
              }`}
            >
              {aiLevelLabels[template.defaultAiLevel]?.label || `L${template.defaultAiLevel}`}
            </span>
          </div>
        </div>

        <Link
          href={`/dashboard/interviews/${template.id}/session`}
          className="inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-5 py-2.5 text-sm font-semibold text-saffron-dark transition-all hover:bg-saffron/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Create Session
        </Link>
      </div>

      {/* Template Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Questions</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {template.questions.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Total Time</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {template.questions.reduce((sum, q) => sum + q.timeLimit, 0)} min
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Default AI Level</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            L{template.defaultAiLevel}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-xs text-gray-500">Created</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {new Date(template.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Questions</h2>

        {template.questions.map((question, index) => (
          <div
            key={question.id}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {question.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        difficultyColors[question.difficulty] || ""
                      }`}
                    >
                      {question.difficulty}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                        aiLevelLabels[question.aiLevel]?.color || ""
                      }`}
                    >
                      {aiLevelLabels[question.aiLevel]?.label || `L${question.aiLevel}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {question.timeLimit} min
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Description
                </h4>
                <p className="whitespace-pre-wrap">{question.description}</p>
              </div>

              {question.constraints && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Constraints
                  </h4>
                  <p className="whitespace-pre-wrap font-mono text-xs bg-gray-100 rounded-lg p-3">
                    {question.constraints}
                  </p>
                </div>
              )}

              {question.examples && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Examples
                  </h4>
                  <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 rounded-lg p-3">
                    {question.examples}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
