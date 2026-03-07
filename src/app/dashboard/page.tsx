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

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
  });

  let totalInterviews = 0;
  let activeSessions = 0;
  let avgScore = 0;
  let passRate = 0;
  let recentSessions: {
    id: string;
    status: string;
    createdAt: Date;
    candidate: { name: string; email: string };
    template: { title: string; role: string };
    auditReport: { overallScore: number; suggestedDecision: string } | null;
  }[] = [];

  if (user?.companyId) {
    const sessions = await prisma.interviewSession.findMany({
      where: { companyId: user.companyId },
      include: {
        candidate: { select: { name: true, email: true } },
        template: { select: { title: true, role: true } },
        auditReport: {
          select: { overallScore: true, suggestedDecision: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    totalInterviews = sessions.length;
    activeSessions = sessions.filter((s) => s.status === "ACTIVE").length;

    const completedWithReport = sessions.filter(
      (s) => s.status === "COMPLETED" && s.auditReport
    );

    if (completedWithReport.length > 0) {
      avgScore =
        completedWithReport.reduce(
          (sum, s) => sum + (s.auditReport?.overallScore || 0),
          0
        ) / completedWithReport.length;

      const hires = completedWithReport.filter(
        (s) => s.auditReport?.suggestedDecision === "HIRE"
      ).length;
      passRate = (hires / completedWithReport.length) * 100;
    }

    recentSessions = sessions.slice(0, 10) as typeof recentSessions;
  }

  const stats = [
    {
      label: "Total Interviews",
      value: totalInterviews,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Active Sessions",
      value: activeSessions,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-green-500 to-green-600",
    },
    {
      label: "Avg Score",
      value: avgScore.toFixed(1),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pass Rate",
      value: `${passRate.toFixed(0)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-cyan-500 to-cyan-600",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Welcome back, {session!.user.name || session!.user.email}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/interviews/new"
          className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-purple-500/50 hover:bg-gray-900/80 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Create Interview
            </h3>
            <p className="text-xs text-gray-400">
              Set up a new interview template with questions
            </p>
          </div>
        </Link>

        <Link
          href="/dashboard/sessions"
          className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-blue-500/50 hover:bg-gray-900/80 group"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">View Sessions</h3>
            <p className="text-xs text-gray-400">
              Browse all interview sessions and results
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Recent Sessions</h2>
        </div>

        {recentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-4 text-sm text-gray-400">
              No interview sessions yet. Create your first interview template to get started.
            </p>
            <Link
              href="/dashboard/interviews/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Interview
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-300">
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
                    <p className="text-xs text-gray-400">
                      {s.template.title} &middot; {s.template.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {s.auditReport && (
                    <span className="text-sm font-medium text-gray-300">
                      {s.auditReport.overallScore.toFixed(1)}/10
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[s.status] || "bg-gray-500/10 text-gray-400 border-gray-500/30"
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
