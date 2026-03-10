import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileVisibilityToggle } from "@/components/ProfileVisibilityToggle";
import Link from "next/link";

export default async function CandidateProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/candidate/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, profilePublic: true },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <p className="text-sm text-white">{session.user.name || "Not set"}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Email
              </label>
              <p className="text-sm text-white">{session.user.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Role
              </label>
              <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
                Candidate
              </span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/practice"
              className="flex items-center gap-3 rounded-lg border border-gray-800 p-3 hover:border-saffron/30 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/10">
                <svg className="w-4 h-4 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Practice Mode</p>
                <p className="text-xs text-gray-500">Sharpen your coding skills</p>
              </div>
            </a>
            <a
              href="/candidate/interviews"
              className="flex items-center gap-3 rounded-lg border border-gray-800 p-3 hover:border-blue-500/30 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">My Interviews</p>
                <p className="text-xs text-gray-500">View all interviews</p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Public Profile Section */}
      <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Public Profile</h2>
        <div className="space-y-4">
          <ProfileVisibilityToggle initialValue={user?.profilePublic ?? true} />

          {user && (
            <Link
              href={`/talent/${user.id}`}
              className="flex items-center gap-3 rounded-lg border border-gray-800 p-3 hover:border-saffron/30 hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-saffron/10">
                <svg className="w-4 h-4 text-saffron" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">View My Public Profile</p>
                <p className="text-xs text-gray-500">See how others see your talent profile</p>
              </div>
              <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
