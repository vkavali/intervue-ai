import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
  });

  let sessions: {
    id: string;
    status: string;
    aiLevel: number;
    createdAt: Date;
    startedAt: Date | null;
    endedAt: Date | null;
    scheduledAt: Date | null;
    totalDurationMinutes: number | null;
    candidate: { name: string; email: string };
    interviewer: { name: string; email: string } | null;
    template: { title: string; role: string; seniority: string };
    auditReport: { overallScore: number; suggestedDecision: string } | null;
  }[] = [];

  if (user?.companyId) {
    sessions = await prisma.interviewSession.findMany({
      where: { companyId: user.companyId },
      include: {
        candidate: { select: { name: true, email: true } },
        interviewer: { select: { name: true, email: true } },
        template: { select: { title: true, role: true, seniority: true } },
        auditReport: {
          select: { overallScore: true, suggestedDecision: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Interview Sessions</h1>
        <p className="mt-1 text-sm text-gray-400">
          View and manage all interview sessions
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">
            No sessions yet
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Sessions will appear here once interviews are scheduled and started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Interview
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Interviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Timer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sessions.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-xs font-medium text-gray-300">
                        {s.candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {s.candidate.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.candidate.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-300">
                      {s.template.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.template.role} &middot; {s.template.seniority}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {s.interviewer?.name || (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[s.status] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {s.status === "PENDING" && s.scheduledAt ? (
                      <span className="text-xs text-yellow-400">
                        Starts {new Date(s.scheduledAt).toLocaleDateString()}
                      </span>
                    ) : s.status === "ACTIVE" && s.startedAt && s.totalDurationMinutes ? (
                      <span className="text-xs text-green-400 font-mono">
                        {s.totalDurationMinutes}m total
                      </span>
                    ) : s.status === "COMPLETED" && s.startedAt && s.endedAt ? (
                      <span className="text-xs text-blue-400 font-mono">
                        {Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)}m
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {s.auditReport ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {s.auditReport.overallScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">/10</span>
                        {s.auditReport.suggestedDecision === "HIRE" && (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-400">
                            HIRE
                          </span>
                        )}
                        {s.auditReport.suggestedDecision === "NO_HIRE" && (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-xs font-medium text-red-400">
                            NO HIRE
                          </span>
                        )}
                        {s.auditReport.suggestedDecision === "FURTHER_ROUND" && (
                          <span className="inline-flex items-center rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-xs font-medium text-yellow-400">
                            FURTHER
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === "ACTIVE" && (
                        <Link
                          href={`/session/${s.id}/watch`}
                          className="text-xs font-medium text-green-400 hover:text-green-300 transition-colors"
                        >
                          Watch Live
                        </Link>
                      )}
                      <Link
                        href={`/dashboard/sessions/${s.id}`}
                        className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Details &rarr;
                      </Link>
                    </div>
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
