import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InviteInterviewerForm } from "./InviteForm";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function InterviewersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "COMPANY_ADMIN") {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
  });

  if (!user?.companyId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
        <h3 className="text-lg font-medium text-gray-900">No Company</h3>
        <p className="mt-2 text-sm text-gray-500">
          You are not associated with a company yet.
        </p>
      </div>
    );
  }

  const interviewers = await prisma.user.findMany({
    where: {
      companyId: user.companyId,
      role: { in: ["INTERVIEWER", "COMPANY_ADMIN"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      interviewerSessions: {
        select: { id: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const company = await prisma.company.findUnique({
    where: { id: user.companyId },
    select: { name: true },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviewers</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team of interviewers at {company?.name || "your company"}.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Interviewers</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{interviewers.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active (Conducted Sessions)</p>
          <p className="mt-1 text-2xl font-bold text-green-400">
            {interviewers.filter((i) => i.interviewerSessions.length > 0).length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Sessions Conducted</p>
          <p className="mt-1 text-2xl font-bold text-saffron">
            {interviewers.reduce((sum, i) => sum + i.interviewerSessions.length, 0)}
          </p>
        </div>
      </div>

      {/* Invite Form */}
      <div className="mb-8">
        <InviteInterviewerForm />
      </div>

      {/* Interviewers List */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/30">
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sessions
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Completed
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {interviewers.map((interviewer) => {
              const totalSessions = interviewer.interviewerSessions.length;
              const completedSessions = interviewer.interviewerSessions.filter(
                (s) => s.status === "COMPLETED"
              ).length;

              return (
                <tr key={interviewer.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron/10 text-xs font-medium text-saffron">
                        {getInitials(interviewer.name)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{interviewer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{interviewer.email}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        interviewer.role === "COMPANY_ADMIN"
                          ? "bg-india-green/10 text-india-green border-india-green/30"
                          : "bg-green-500/10 text-green-400 border-green-500/30"
                      }`}
                    >
                      {interviewer.role === "COMPANY_ADMIN" ? "Admin" : "Interviewer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{totalSessions}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{completedSessions}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(interviewer.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {interviewers.length === 0 && (
          <div className="px-6 py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No interviewers yet</h3>
            <p className="mt-2 text-sm text-gray-500">
              Invite interviewers to start conducting AI-powered interviews.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
