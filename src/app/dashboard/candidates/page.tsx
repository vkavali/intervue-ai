import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { StageDropdown } from "./StageDropdown";

const stageColors: Record<string, string> = {
  SCREENING: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  TECHNICAL: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  SYSTEM_DESIGN: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  BEHAVIORAL: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  FINAL: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  HIRED: "bg-green-500/10 text-green-400 border-green-500/30",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/30",
  ON_HOLD: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

function formatStage(stage: string): string {
  return stage.replace(/_/g, " ");
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function CandidatePipelinePage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
  });

  type PipelineEntry = {
    id: string;
    role: string;
    seniority: string;
    stage: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    candidate: {
      id: string;
      name: string;
      email: string;
      candidateSessions: {
        id: string;
        status: string;
        createdAt: Date;
        template: { title: string; role: string; roundType: string };
        auditReport: {
          overallScore: number;
          suggestedDecision: string;
        } | null;
      }[];
    };
  };

  let pipelineEntries: PipelineEntry[] = [];
  const groupedByRole: Record<
    string,
    { role: string; seniority: string; entries: PipelineEntry[] }
  > = {};

  if (user?.companyId) {
    pipelineEntries = await prisma.candidatePipeline.findMany({
      where: { companyId: user.companyId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            candidateSessions: {
              where: { companyId: user.companyId },
              include: {
                template: {
                  select: { title: true, role: true, roundType: true },
                },
                auditReport: {
                  select: {
                    overallScore: true,
                    suggestedDecision: true,
                  },
                },
              },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    }) as PipelineEntry[];

    for (const entry of pipelineEntries) {
      const key = `${entry.role}__${entry.seniority}`;
      if (!groupedByRole[key]) {
        groupedByRole[key] = {
          role: entry.role,
          seniority: entry.seniority,
          entries: [],
        };
      }
      groupedByRole[key].entries.push(entry);
    }
  }

  const roleGroups = Object.values(groupedByRole);

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Candidate Pipeline</h1>
          <p className="mt-1 text-sm text-gray-400">
            Track candidates across all roles and stages in your hiring pipeline
          </p>
        </div>
        <Link
          href="/dashboard/candidates/add"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Candidate
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Total Candidates</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {pipelineEntries.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Active Roles</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {roleGroups.length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">In Final Stage</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {pipelineEntries.filter((e) => e.stage === "FINAL").length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <p className="text-sm text-gray-400">Hired</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {pipelineEntries.filter((e) => e.stage === "HIRED").length}
          </p>
        </div>
      </div>

      {/* Pipeline by Role */}
      {roleGroups.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">
            No candidates in the pipeline
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Add candidates to start tracking them through your hiring process.
          </p>
          <Link
            href="/dashboard/candidates/add"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add First Candidate
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {roleGroups.map((group) => {
            const groupKey = `${group.role}__${group.seniority}`;
            return (
              <div
                key={groupKey}
                className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900"
              >
                {/* Role Header */}
                <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <svg
                        className="h-5 w-5 text-purple-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 13.255A23.193 23.193 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {group.role}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {group.seniority} &middot;{" "}
                        {group.entries.length} candidate
                        {group.entries.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/candidates/compare?role=${encodeURIComponent(group.role)}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/20 hover:text-purple-300"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Compare All for Role
                  </Link>
                </div>

                {/* Candidates Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50 bg-gray-950/30">
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Current Stage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Rounds
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Avg Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {group.entries.map((entry) => {
                        const sessions =
                          entry.candidate.candidateSessions || [];
                        const completedWithReport = sessions.filter(
                          (s) =>
                            s.status === "COMPLETED" && s.auditReport
                        );
                        const roundsCompleted = completedWithReport.length;
                        const avgScore =
                          roundsCompleted > 0
                            ? completedWithReport.reduce(
                                (sum, s) =>
                                  sum +
                                  (s.auditReport?.overallScore || 0),
                                0
                              ) / roundsCompleted
                            : null;
                        const lastActivity =
                          sessions.length > 0
                            ? sessions[0].createdAt
                            : entry.updatedAt;

                        return (
                          <tr
                            key={entry.id}
                            className="transition-colors hover:bg-gray-800/30"
                          >
                            {/* Name */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-medium text-gray-300">
                                  {getInitials(entry.candidate.name)}
                                </div>
                                <span className="text-sm font-medium text-white">
                                  {entry.candidate.name}
                                </span>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {entry.candidate.email}
                            </td>

                            {/* Stage Badge */}
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                  stageColors[entry.stage] ||
                                  "bg-gray-500/10 text-gray-400 border-gray-500/30"
                                }`}
                              >
                                {formatStage(entry.stage)}
                              </span>
                            </td>

                            {/* Rounds Completed */}
                            <td className="px-6 py-4 text-sm text-gray-300">
                              {roundsCompleted}
                            </td>

                            {/* Avg Score */}
                            <td className="px-6 py-4">
                              {avgScore !== null ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-sm font-medium text-white">
                                    {avgScore.toFixed(1)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    /100
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  --
                                </span>
                              )}
                            </td>

                            {/* Last Activity */}
                            <td className="px-6 py-4 text-xs text-gray-400">
                              {new Date(
                                lastActivity
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-3">
                                <Link
                                  href={`/dashboard/sessions?candidate=${entry.candidate.id}`}
                                  className="text-xs font-medium text-purple-400 transition-colors hover:text-purple-300"
                                >
                                  View Details
                                </Link>
                                <StageDropdown
                                  entryId={entry.id}
                                  currentStage={entry.stage}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
