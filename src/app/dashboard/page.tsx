import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  ACTIVE: "bg-green-500/10 text-green-400 border-green-500/30",
  COMPLETED: "bg-india-green/10 text-india-green border-india-green/30",
  CANCELLED: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
  });

  const isAdmin = session!.user.role === "COMPANY_ADMIN";

  let recentSessions: {
    id: string;
    status: string;
    createdAt: Date;
    candidate: { name: string; email: string };
    template: { title: string; role: string };
    auditReport: { overallScore: number; suggestedDecision: string } | null;
  }[] = [];

  let totalCount = 0;
  let activeCount = 0;
  let completedCount = 0;
  let avgScore = 0;
  let passRate = 0;

  if (user?.companyId) {
    const whereClause = isAdmin
      ? { companyId: user.companyId }
      : { companyId: user.companyId, interviewerId: user.id };

    const sessions = await prisma.interviewSession.findMany({
      where: whereClause,
      include: {
        candidate: { select: { name: true, email: true } },
        template: { select: { title: true, role: true } },
        auditReport: {
          select: { overallScore: true, suggestedDecision: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    totalCount = sessions.length;
    activeCount = sessions.filter((s) => s.status === "ACTIVE").length;
    completedCount = sessions.filter((s) => s.status === "COMPLETED").length;

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

  const adminStats = [
    {
      label: "Total Interviews",
      value: totalCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-saffron to-india-green",
    },
    {
      label: "Active Sessions",
      value: activeCount,
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
      color: "from-saffron to-saffron-dark",
    },
    {
      label: "Pass Rate",
      value: `${passRate.toFixed(0)}%`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-india-green to-india-green-dark",
    },
  ];

  const interviewerStats = [
    {
      label: "My Sessions",
      value: totalCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-saffron to-saffron-dark",
    },
    {
      label: "Active Now",
      value: activeCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
      color: "from-green-500 to-green-600",
    },
    {
      label: "Completed",
      value: completedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-india-green to-india-green-dark",
    },
    {
      label: "Avg Candidate Score",
      value: avgScore.toFixed(1),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: "from-blush to-blush-dark",
    },
  ];

  const stats = isAdmin ? adminStats : interviewerStats;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? "Manage your company\u2019s hiring pipeline"
            : "Your interviewing dashboard"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
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
        {isAdmin ? (
          <>
            <Link
              href="/dashboard/interviews/new"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-saffron/50 hover:bg-gray-50 group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-saffron/10 text-saffron group-hover:bg-saffron/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Create Interview
                </h3>
                <p className="text-xs text-gray-500">
                  Set up a new interview template with questions
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-india-green/50 hover:bg-gray-50 group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-india-green/10 text-india-green group-hover:bg-india-green/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">View Sessions</h3>
                <p className="text-xs text-gray-500">
                  Browse all interview sessions and results
                </p>
              </div>
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/dashboard/sessions"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-india-green/50 hover:bg-gray-50 group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-india-green/10 text-india-green group-hover:bg-india-green/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">My Sessions</h3>
                <p className="text-xs text-gray-500">
                  View and manage your interview sessions
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/calendar"
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-india-green/50 hover:bg-gray-50 group"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-india-green/10 text-india-green group-hover:bg-india-green/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">My Calendar</h3>
                <p className="text-xs text-gray-500">
                  View your upcoming interview schedule
                </p>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {isAdmin ? "Recent Sessions" : "My Recent Sessions"}
          </h2>
        </div>

        {recentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-4 text-sm text-gray-500">
              {isAdmin
                ? "No interview sessions yet. Create your first interview template to get started."
                : "No interview sessions assigned to you yet."}
            </p>
            {isAdmin && (
              <Link
                href="/dashboard/interviews/new"
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Interview
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/sessions/${s.id}`}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
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
                      {s.template.title} &middot; {s.template.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {s.auditReport && (
                    <span className="text-sm font-medium text-gray-700">
                      {s.auditReport.overallScore.toFixed(1)}/10
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      statusColors[s.status] || "bg-gray-500/10 text-gray-500 border-gray-500/30"
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
