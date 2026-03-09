import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  ACTIVE: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
  COMPLETED: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  CANCELLED: { bg: "bg-gray-500/10", text: "text-gray-400", dot: "bg-gray-400" },
};

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/candidate");
  }

  const userId = session.user.id;

  // Fetch candidate's interview sessions
  const sessions = await prisma.interviewSession.findMany({
    where: { candidateId: userId },
    include: {
      template: {
        select: { title: true, role: true, seniority: true },
      },
      company: {
        select: { name: true, logo: true },
      },
      auditReport: {
        select: {
          overallScore: true,
          suggestedDecision: true,
          problemComprehension: true,
          solutionCorrectness: true,
          codeQuality: true,
          communication: true,
          aiUsageQuality: true,
          timeManagement: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  // Check if an ACTIVE session's time has expired
  const isSessionExpired = (s: typeof sessions[number]) => {
    if (s.startedAt && s.totalDurationMinutes) {
      const expiresAt = new Date(s.startedAt).getTime() + s.totalDurationMinutes * 60 * 1000;
      return Date.now() > expiresAt;
    }
    // If scheduled in the past and no startedAt, also treat as expired
    if (s.scheduledAt && new Date(s.scheduledAt) <= now && !s.startedAt) return true;
    return false;
  };

  const activeSessions = sessions.filter((s) => s.status === "ACTIVE" && !isSessionExpired(s));
  // Split PENDING into upcoming (future/unscheduled) and past-due (expired)
  const upcomingSessions = sessions.filter(
    (s) => s.status === "PENDING" && (!s.scheduledAt || new Date(s.scheduledAt) > now)
  );
  const pastDueSessions = sessions.filter(
    (s) =>
      (s.status === "PENDING" && s.scheduledAt && new Date(s.scheduledAt) <= now) ||
      (s.status === "ACTIVE" && isSessionExpired(s))
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session.user.name || "Candidate"}
        </h1>
        <p className="mt-1 text-gray-400">
          Track your interviews and practice to improve your skills.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Upcoming</p>
          <p className="mt-2 text-3xl font-bold text-yellow-400">{upcomingSessions.length}</p>
          <p className="mt-1 text-xs text-gray-500">Scheduled interviews</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-400">{activeSessions.length}</p>
          <p className="mt-1 text-xs text-gray-500">In progress</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</p>
          <p className="mt-2 text-3xl font-bold text-blue-400">{completedSessions.length}</p>
          <p className="mt-1 text-xs text-gray-500">Finished interviews</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</p>
          <p className="mt-2 text-3xl font-bold text-purple-400">
            {completedSessions.length > 0
              ? (
                  completedSessions.reduce(
                    (sum, s) => sum + (s.auditReport?.overallScore ?? 0),
                    0
                  ) / completedSessions.filter((s) => s.auditReport).length || 0
                ).toFixed(1)
              : "--"}
          </p>
          <p className="mt-1 text-xs text-gray-500">Across all interviews</p>
        </div>
      </div>

      {/* Practice Mode Card */}
      <div className="mb-8">
        <Link
          href="/practice"
          className="group block rounded-xl border border-purple-500/20 bg-gradient-to-r from-purple-600/10 via-gray-900/50 to-blue-600/10 p-6 transition-all hover:border-purple-500/40 hover:from-purple-600/20 hover:to-blue-600/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Practice Mode</h3>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                Sharpen your coding skills with curated problems. Choose your AI assistance level and practice at your own pace.
              </p>
            </div>
            <svg className="w-6 h-6 text-purple-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Active Interviews */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Active Interviews
          </h2>
          <div className="space-y-3">
            {activeSessions.map((s) => {
              const statusStyle = statusColors[s.status];
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-green-500/20 bg-gray-900/50 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{s.template.title}</h3>
                      <p className="text-xs text-gray-400">
                        {s.company.name} &middot; {s.template.role} &middot; {s.template.seniority}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      {s.status}
                    </span>
                    <Link
                      href={`/session/${s.id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
                    >
                      Join Now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Interviews */}
      {upcomingSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Upcoming Interviews</h2>
          <div className="space-y-3">
            {upcomingSessions.map((s) => {
              const statusStyle = statusColors[s.status];
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{s.template.title}</h3>
                      <p className="text-xs text-gray-400">
                        {s.company.name} &middot; {s.template.role} &middot; {s.template.seniority}
                      </p>
                      {s.scheduledAt && (
                        <p className="text-xs text-yellow-400 mt-1">
                          Scheduled: {new Date(s.scheduledAt).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      Scheduled
                    </span>
                    <Link
                      href={`/session/${s.id}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 transition-colors"
                    >
                      Join
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Previous / Missed Interviews */}
      {pastDueSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Previous Interviews
          </h2>
          <div className="space-y-3">
            {pastDueSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-gray-700/50 bg-gray-900/30 p-5 opacity-75"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/10 text-gray-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300">{s.template.title}</h3>
                    <p className="text-xs text-gray-500">
                      {s.company.name} &middot; {s.template.role} &middot; {s.template.seniority}
                    </p>
                    <p className="text-xs text-red-400/70 mt-1">
                      Expired: {new Date(s.scheduledAt!).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-gray-500/10 text-gray-400">
                    Expired
                  </span>
                  <a
                    href={`mailto:?subject=Interview Reschedule Request - ${s.template.title}&body=Hi, I would like to request a reschedule for my interview: ${s.template.title} (${s.template.role}).`}
                    className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    Contact Recruiter
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Interviews */}
      {completedSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Completed Interviews</h2>
          <div className="space-y-3">
            {completedSessions.map((s) => {
              const report = s.auditReport;
              const decisionColors: Record<string, string> = {
                HIRE: "text-green-400 bg-green-500/10 border-green-500/30",
                NO_HIRE: "text-red-400 bg-red-500/10 border-red-500/30",
                FURTHER_ROUND: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
              };

              return (
                <div
                  key={s.id}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{s.template.title}</h3>
                        <p className="text-xs text-gray-400">
                          {s.company.name} &middot; {s.template.role} &middot; {s.template.seniority}
                        </p>
                        {s.endedAt && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Completed {new Date(s.endedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {report && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-white">
                            {report.overallScore.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">Overall Score</p>
                        </div>
                        {report.suggestedDecision && (
                          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${decisionColors[report.suggestedDecision] || "text-gray-400"}`}>
                            {report.suggestedDecision.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  {report && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        { label: "Problem Comprehension", value: report.problemComprehension },
                        { label: "Solution Correctness", value: report.solutionCorrectness },
                        { label: "Code Quality", value: report.codeQuality },
                        { label: "Communication", value: report.communication },
                        { label: "AI Usage", value: report.aiUsageQuality },
                        { label: "Time Management", value: report.timeManagement },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-lg bg-gray-800/50 p-3">
                          <p className="text-xs text-gray-500 truncate">{metric.label}</p>
                          <p className={`mt-1 text-lg font-semibold ${
                            metric.value >= 8 ? "text-green-400" :
                            metric.value >= 6 ? "text-yellow-400" :
                            metric.value >= 4 ? "text-orange-400" : "text-red-400"
                          }`}>
                            {metric.value.toFixed(1)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {!report && (
                    <div className="rounded-lg bg-gray-800/30 border border-gray-800 p-4 text-center">
                      <p className="text-sm text-gray-500">
                        Audit report is being generated. Check back soon.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-white">No interviews yet</h3>
          <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
            You have not been invited to any interviews yet. In the meantime, try sharpening your skills with practice mode.
          </p>
          <Link
            href="/practice"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Start Practicing
          </Link>
        </div>
      )}
    </div>
  );
}
