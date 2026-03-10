import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const statusColors: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-400", dot: "bg-yellow-400", label: "Scheduled" },
  ACTIVE: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-400", label: "In Progress" },
  COMPLETED: { bg: "bg-india-green/10", text: "text-india-green", dot: "bg-blue-400", label: "Completed" },
  CANCELLED: { bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400", label: "Cancelled" },
};

export default async function CandidateInterviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/candidate/interviews");
  }

  const interviews = await prisma.interviewSession.findMany({
    where: { candidateId: session.user.id },
    include: {
      template: {
        select: { title: true, role: true, seniority: true, roundType: true },
      },
      company: {
        select: { name: true },
      },
      auditReport: {
        select: { overallScore: true, suggestedDecision: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
        <p className="mt-1 text-gray-500">
          View all your scheduled, active, and completed interviews.
        </p>
      </div>

      {interviews.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No interviews yet</h3>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
            You haven&apos;t been invited to any interviews yet. Practice your skills while you wait.
          </p>
          <Link
            href="/practice"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-saffron bg-transparent px-5 py-2.5 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            Start Practicing
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const status = statusColors[interview.status] || statusColors.CANCELLED;
            const now = new Date();
            const isTimeExpired = interview.status === "ACTIVE" && interview.startedAt && interview.totalDurationMinutes
              ? Date.now() > new Date(interview.startedAt).getTime() + interview.totalDurationMinutes * 60 * 1000
              : false;
            const isPastDue =
              (interview.status === "PENDING" && interview.scheduledAt && new Date(interview.scheduledAt) <= now) ||
              isTimeExpired;
            return (
              <div
                key={interview.id}
                className={`rounded-xl border bg-white p-5 transition-colors ${
                  isPastDue ? "border-gray-200 opacity-75" : "border-gray-200 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPastDue ? "bg-gray-500/10 text-gray-500" : `${status.bg} ${status.text}`}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${isPastDue ? "text-gray-700" : "text-gray-900"}`}>
                        {interview.template.title}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {interview.company.name} &middot; {interview.template.role} &middot; {interview.template.seniority} &middot; {interview.template.roundType}
                      </p>
                      {interview.scheduledAt && (
                        <p className={`text-xs mt-1 ${isPastDue ? "text-accent-red/70" : "text-gray-500"}`}>
                          {isPastDue ? "Expired: " : ""}
                          {new Date(interview.scheduledAt).toLocaleDateString("en-US", {
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
                    {interview.auditReport && (
                      <div className="text-right mr-2">
                        <p className="text-lg font-bold text-gray-900">
                          {interview.auditReport.overallScore.toFixed(1)}
                        </p>
                        <p className="text-[10px] text-gray-500 uppercase">Score</p>
                      </div>
                    )}

                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      isPastDue ? "bg-gray-500/10 text-gray-500" : `${status.bg} ${status.text}`
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${isPastDue ? "bg-gray-400" : status.dot}`} />
                      {isPastDue ? "Expired" : status.label}
                    </span>

                    {interview.status === "ACTIVE" && !isPastDue && (
                      <Link
                        href={`/session/${interview.id}`}
                        className="rounded-lg border border-india-green bg-transparent px-4 py-2 text-sm font-medium text-gray-900 hover:bg-india-green/10 transition-colors"
                      >
                        Resume
                      </Link>
                    )}

                    {interview.status === "PENDING" && !isPastDue && (
                      <Link
                        href={`/session/${interview.id}`}
                        className="rounded-lg border border-india-green bg-transparent px-4 py-2 text-sm font-medium text-gray-900 hover:bg-india-green/10 transition-colors"
                      >
                        Join
                      </Link>
                    )}

                    {interview.status === "COMPLETED" && interview.auditReport && (
                      <Link
                        href={`/candidate/report/${interview.id}`}
                        className="rounded-lg border border-saffron/30 bg-saffron/10 px-3 py-2 text-xs font-medium text-saffron hover:bg-saffron/20 transition-colors"
                      >
                        View Report
                      </Link>
                    )}

                    {isPastDue && (
                      <a
                        href={`mailto:?subject=Interview Reschedule Request - ${interview.template.title}&body=Hi, I would like to request a reschedule for my interview: ${interview.template.title} (${interview.template.role}).`}
                        className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                      >
                        Contact Recruiter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
