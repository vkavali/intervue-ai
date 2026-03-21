import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const aiLevelLabels: Record<number, { label: string; color: string }> = {
  0: { label: "L0 No AI", color: "text-accent-red" },
  1: { label: "L1 Hint", color: "text-yellow-400" },
  2: { label: "L2 Scaffold", color: "text-india-green" },
  3: { label: "L3 Guide", color: "text-saffron" },
  4: { label: "L4 Copilot", color: "text-green-400" },
};

const seniorityColors: Record<string, string> = {
  JUNIOR: "bg-green-500/10 text-green-400 border-green-500/30",
  MID: "bg-india-green/10 text-india-green border-india-green/30",
  SENIOR: "bg-saffron/10 text-saffron border-saffron/30",
  STAFF: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  PRINCIPAL: "bg-accent-red/10 text-accent-red border-accent-red/30",
};

export default async function InterviewsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) { return null; }

  if (session.user.role !== "COMPANY_ADMIN") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  let templates: {
    id: string;
    title: string;
    role: string;
    seniority: string;
    roundType: string;
    defaultAiLevel: number;
    createdAt: Date;
    questions: { id: string }[];
  }[] = [];

  if (user?.companyId) {
    templates = await prisma.interviewTemplate.findMany({
      where: { companyId: user.companyId },
      include: { questions: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Templates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your interview templates and questions
          </p>
        </div>
        <Link
          href="/dashboard/interviews/new"
          className="inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-4 py-2.5 text-sm font-semibold text-saffron-dark transition-all hover:bg-saffron/10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Template
        </Link>
      </div>

      {/* Templates Table */}
      {templates.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No interview templates yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Create your first interview template to start assessing candidates.
          </p>
          <Link
            href="/dashboard/interviews/new"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Template
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Seniority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  AI Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Questions
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
                <th className="px-6 py-3" />

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {templates.map((template) => (
                <tr
                  key={template.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/interviews/${template.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-saffron transition-colors"
                    >
                      {template.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {template.roundType}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {template.role}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        seniorityColors[template.seniority] ||
                        "bg-gray-500/10 text-gray-500 border-gray-500/30"
                      }`}
                    >
                      {template.seniority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-mono font-medium ${
                        aiLevelLabels[template.defaultAiLevel]?.color || "text-gray-500"
                      }`}
                    >
                      {aiLevelLabels[template.defaultAiLevel]?.label || `L${template.defaultAiLevel}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {template.questions.length}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/interviews/${template.id}`}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/dashboard/interviews/${template.id}/session`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-saffron bg-transparent px-3 py-1.5 text-xs font-semibold text-saffron-dark transition-all hover:bg-saffron/10"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Use Template
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
