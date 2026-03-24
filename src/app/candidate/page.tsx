import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveProblem } from "@/lib/problem-resolver";
import { getLevel, xpProgressInLevel } from "@/lib/gamification";
import Link from "next/link";
import CandidateDashboardClient from "./CandidateDashboardClient";

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400" },
  ACTIVE: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400" },
  COMPLETED: { bg: "bg-india-green/10", text: "text-india-green", dot: "bg-blue-400" },
  CANCELLED: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
};

export default async function CandidateDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/candidate");
  }

  const userId = session.user.id;

  // Fetch user gamification data (graceful if tables/columns don't exist yet)
  let xp = 0;
  let userGam: { currentStreak: number; longestStreak: number; lastActiveDate: Date | null } | null = null;
  let globalRank = 1;
  let recentBadges: Array<{ badge: { slug: string; name: string; icon: string }; earnedAt: Date }> = [];
  let heatmap: Array<{ date: string; problems: number; xpEarned: number }> = [];

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
      },
    });
    xp = user?.xp || 0;
    userGam = user ? { currentStreak: user.currentStreak, longestStreak: user.longestStreak, lastActiveDate: user.lastActiveDate } : null;

    globalRank = (await prisma.user.count({
      where: { xp: { gt: xp }, role: "CANDIDATE" },
    })) + 1;
  } catch {
    // Gamification columns may not exist yet
  }

  const level = getLevel(xp);
  const xpProgress = xpProgressInLevel(xp);

  // Fetch gamification stats
  let problemsSolved = 0;
  try {
    problemsSolved = await prisma.practiceProgress.count({
      where: { userId, status: "COMPLETED" },
    });
  } catch {
    // PracticeProgress table may not exist yet
  }

  try {
    // Get recent badges
    recentBadges = await prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
      take: 5,
    });

    // Get heatmap data (last 365 days)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    heatmap = await prisma.dailyActivity.findMany({
      where: { userId, date: { gte: oneYearAgo.toISOString().split("T")[0] } },
      orderBy: { date: "asc" },
    });
  } catch {
    // Badge/activity tables may not exist yet
  }

  // Fetch candidate's interview sessions
  const sessionQuery = prisma.interviewSession.findMany({
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
  type SessionResult = Awaited<typeof sessionQuery>;
  let sessions: SessionResult = [];
  try {
    sessions = await sessionQuery;
  } catch {
    // InterviewSession query may fail if schema mismatch
  }

  // Fetch practice progress
  let practiceProgress: Array<{ id: string; bankProblemId: string | null; problemId: string | null; status: string; timeSpentSeconds: number; updatedAt: Date }> = [];
  try {
    practiceProgress = await prisma.practiceProgress.findMany({
      where: { userId },
      select: { id: true, bankProblemId: true, problemId: true, status: true, timeSpentSeconds: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // PracticeProgress table may not exist yet
  }

  const practiceSolved = practiceProgress.filter((p) => p.status === "COMPLETED").length;
  const practiceInProgress = practiceProgress.filter((p) => p.status === "IN_PROGRESS").length;
  const recentPractice = practiceProgress.slice(0, 5);

  const now = new Date();
  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");

  const isSessionExpired = (s: typeof sessions[number]) => {
    if (s.startedAt && s.totalDurationMinutes) {
      const expiresAt = new Date(s.startedAt).getTime() + s.totalDurationMinutes * 60 * 1000;
      return Date.now() > expiresAt;
    }
    if (s.scheduledAt && new Date(s.scheduledAt) <= now && !s.startedAt) return true;
    return false;
  };

  const activeSessions = sessions.filter((s) => s.status === "ACTIVE" && !isSessionExpired(s));
  const upcomingSessions = sessions.filter(
    (s) => s.status === "PENDING" && (!s.scheduledAt || new Date(s.scheduledAt) > now)
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name || "Candidate"}
        </h1>
        <p className="mt-1 text-gray-500">
          Track your progress, earn XP, and level up your coding skills.
        </p>
      </div>

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Level</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10 text-lg font-bold text-saffron">
              {level}
            </span>
            <div className="flex-1">
              <div className="h-2 w-full rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-saffron to-india-green"
                  style={{ width: `${xpProgress.percentage}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {xpProgress.current}/{xpProgress.needed} XP
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-2xl ${userGam?.currentStreak ? "animate-pulse" : "opacity-40"}`}>🔥</span>
            <p className="text-3xl font-bold text-gray-900">{userGam?.currentStreak || 0}</p>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Best: {userGam?.longestStreak || 0} days
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Problems Solved</p>
          <p className="mt-2 text-3xl font-bold text-india-green">{problemsSolved}</p>
          <p className="mt-1 text-xs text-gray-500">{xp.toLocaleString()} total XP</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Global Rank</p>
          <p className="mt-2 text-3xl font-bold text-saffron">#{globalRank}</p>
          <p className="mt-1 text-xs text-gray-500">
            <Link href="/candidate/leaderboard" className="text-saffron hover:text-saffron-dark transition-colors">
              View Leaderboard &rarr;
            </Link>
          </p>
        </div>
      </div>

      {/* Daily Challenge + Activity Heatmap — client component for interactivity */}
      <CandidateDashboardClient
        heatmap={heatmap.map((h) => ({ date: h.date, problems: h.problems, xpEarned: h.xpEarned }))}
        recentBadges={recentBadges.map((b) => ({
          slug: b.badge.slug,
          name: b.badge.name,
          icon: b.badge.icon,
          earnedAt: b.earnedAt.toISOString(),
        }))}
      />

      {/* Practice Progress */}
      {(practiceSolved > 0 || practiceInProgress > 0) && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Continue Practicing</h2>
            <Link href="/practice" className="text-xs text-saffron hover:text-saffron-dark transition-colors">
              View All &rarr;
            </Link>
          </div>
          <div className="space-y-2">
            {recentPractice.map((p) => {
              const problemData = resolveProblem(p.bankProblemId || p.problemId || "");
              const title = problemData?.title || p.bankProblemId || p.problemId || "Unknown Problem";
              const practiceStatusColors: Record<string, { bg: string; text: string }> = {
                COMPLETED: { bg: "bg-green-500/10", text: "text-green-400" },
                IN_PROGRESS: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
                ABANDONED: { bg: "bg-gray-500/10", text: "text-gray-500" },
              };
              const style = practiceStatusColors[p.status] || practiceStatusColors.IN_PROGRESS;
              const timeStr = p.timeSpentSeconds >= 3600
                ? `${Math.floor(p.timeSpentSeconds / 3600)}h ${Math.floor((p.timeSpentSeconds % 3600) / 60)}m`
                : `${Math.floor(p.timeSpentSeconds / 60)}m`;
              return (
                <Link
                  key={p.id}
                  href={`/practice/${p.bankProblemId || p.problemId}`}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}>
                      {p.status === "COMPLETED" ? "Solved" : p.status === "IN_PROGRESS" ? "In Progress" : "Abandoned"}
                    </span>
                    <span className="text-sm text-gray-700">{title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-500">
                    <span>{timeStr}</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Interviews */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Active Interviews
          </h2>
          <div className="space-y-3">
            {activeSessions.map((s) => {
              const statusStyle = statusColors[s.status];
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-green-500/20 bg-white p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{s.template.title}</h3>
                      <p className="text-xs text-gray-500">
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
                      className="rounded-lg border border-india-green bg-transparent px-4 py-2 text-sm font-medium text-gray-900 hover:bg-india-green/10 transition-colors"
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Interviews</h2>
          <div className="space-y-3">
            {upcomingSessions.map((s) => {
              const statusStyle = statusColors[s.status];
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{s.template.title}</h3>
                      <p className="text-xs text-gray-500">
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
                      className="rounded-lg border border-india-green bg-transparent px-4 py-2 text-sm font-medium text-gray-900 hover:bg-india-green/10 transition-colors"
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

      {/* Completed Interviews */}
      {completedSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Interviews</h2>
          <div className="space-y-3">
            {completedSessions.slice(0, 3).map((s) => {
              const report = s.auditReport;
              return (
                <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-india-green/10 text-india-green">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{s.template.title}</h3>
                        <p className="text-xs text-gray-500">
                          {s.company.name} &middot; {s.template.role}
                        </p>
                      </div>
                    </div>
                    {report && (
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-gray-900">{report.overallScore.toFixed(1)}</p>
                        <Link href={`/candidate/report/${s.id}`} className="text-xs text-saffron hover:text-saffron-dark">
                          View Report &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sessions.length === 0 && problemsSolved === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-lg font-semibold text-gray-900">Get Started</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            Start solving practice problems to earn XP, level up, and climb the leaderboard!
          </p>
          <Link
            href="/practice"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-5 py-2.5 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            Start Practicing
          </Link>
        </div>
      )}
    </div>
  );
}
