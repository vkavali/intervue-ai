import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SessionTimer } from "./SessionTimer";
import { ReinviteButton } from "./ReinviteButton";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-india-green/10 text-india-green border-india-green/30",
  CANCELLED: "bg-accent-red/10 text-accent-red border-accent-red/30",
  EXPIRED: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) { return null; }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
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

  // Auto-expire PENDING sessions whose scheduledAt has passed
  if (user?.companyId) {
    await prisma.interviewSession.updateMany({
      where: {
        companyId: user.companyId,
        status: "PENDING",
        scheduledAt: { not: null, lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Interview Sessions</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all interview sessions
        </p>
      </div>

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No sessions yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Sessions will appear here once interviews are scheduled and started.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Interview
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Interviewer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Timer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sessions.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                        {s.candidate.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {s.candidate.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {s.candidate.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      {s.template.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.template.role} &middot; {s.template.seniority}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {s.interviewer?.name || (
                      <span className="text-gray-500">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[s.status] || "bg-gray-500/10 text-gray-500 border-gray-500/30"
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
                      <SessionTimer
                        startedAt={s.startedAt.toISOString()}
                        totalDurationMinutes={s.totalDurationMinutes}
                      />
                    ) : s.status === "COMPLETED" && s.startedAt && s.endedAt ? (
                      <span className="text-xs text-india-green font-mono">
                        {Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)}m
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">--</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {s.auditReport ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {s.auditReport.overallScore.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">/10</span>
                        {s.auditReport.suggestedDecision === "HIRE" && (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-xs font-medium text-green-400">
                            HIRE
                          </span>
                        )}
                        {s.auditReport.suggestedDecision === "NO_HIRE" && (
                          <span className="inline-flex items-center rounded-full bg-accent-red/10 border border-accent-red/30 px-2 py-0.5 text-xs font-medium text-accent-red">
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
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {s.status === "ACTIVE" && (
                        (() => {
                          const isSessionExpired = s.startedAt && s.totalDurationMinutes &&
                            new Date(s.startedAt).getTime() + s.totalDurationMinutes * 60 * 1000 < Date.now();
                          if (isSessionExpired) {
                            return <span className="text-xs font-medium text-accent-red">Expired</span>;
                          }
                          const isInterviewer = s.interviewer?.email === user?.email;
                          return (
                            <Link
                              href={`/session/${s.id}/watch`}
                              className="inline-flex items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600 hover:bg-green-500/20 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {isInterviewer ? "Join Interview" : "Watch Live"}
                            </Link>
                          );
                        })()
                      )}
                      {s.status === "PENDING" && s.interviewer?.email === user?.email && (
                        <span className="text-xs font-medium text-yellow-600">Assigned to you</span>
                      )}
                      {(s.status === "EXPIRED" || s.status === "CANCELLED") && (
                        <ReinviteButton sessionId={s.id} />
                      )}
                      <Link
                        href={`/dashboard/sessions/${s.id}`}
                        className="text-xs font-medium text-saffron hover:text-saffron-dark transition-colors"
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
