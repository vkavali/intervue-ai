import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { email: session!.user.email! },
    include: { company: true },
  });

  if (!user?.company) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-16 text-center">
        <h3 className="text-lg font-medium text-white">No Company</h3>
        <p className="mt-2 text-sm text-gray-400">
          You are not associated with a company yet.
        </p>
      </div>
    );
  }

  const teamSize = await prisma.user.count({
    where: { companyId: user.companyId! },
  });

  const totalSessions = await prisma.interviewSession.count({
    where: { companyId: user.companyId! },
  });

  const totalTemplates = await prisma.interviewTemplate.count({
    where: { companyId: user.companyId! },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your company settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Company Info + Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <SettingsForm
            companyId={user.company.id}
            companyName={user.company.name}
            companyLogo={user.company.logo}
          />

          {/* AI Defaults */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">AI Configuration</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-400">AI Assist Levels</p>
                  <p className="mt-1 text-sm text-white">L0 (No AI) to L4 (Copilot)</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Set per-template and override per-session
                  </p>
                </div>
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
                  <p className="text-xs text-gray-400">AI Audit Engine</p>
                  <p className="mt-1 text-sm text-white">Enabled</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Automatic post-session analysis and scoring
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <svg className="mt-0.5 h-5 w-5 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-300">Anti-Cheat Protections</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Copy-paste prevention, tab-switch detection, and navigation prevention are automatically enabled during live interview sessions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <p className="text-sm text-white">{user.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <p className="text-sm text-white">{user.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Role
                </label>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-xs font-medium text-blue-400">
                  {user.role === "COMPANY_ADMIN" ? "Company Admin" : user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Plan & Usage */}
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-600/5 to-gray-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Current Plan</h2>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-purple-400">{user.company.plan}</span>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              {user.company.plan === "STARTER" && (
                <>
                  <p>Up to 10 interviews/month</p>
                  <p>Basic AI levels (L0-L2)</p>
                  <p>Standard audit reports</p>
                </>
              )}
              {user.company.plan === "GROWTH" && (
                <>
                  <p>Up to 50 interviews/month</p>
                  <p>All AI levels (L0-L4)</p>
                  <p>Detailed audit reports</p>
                </>
              )}
              {user.company.plan === "ENTERPRISE" && (
                <>
                  <p>Unlimited interviews</p>
                  <p>All AI levels + custom</p>
                  <p>Advanced analytics</p>
                </>
              )}
              {user.company.plan === "PAY_PER_INTERVIEW" && (
                <>
                  <p>Pay as you go</p>
                  <p>All AI levels (L0-L4)</p>
                  <p>Standard audit reports</p>
                </>
              )}
            </div>
            <a
              href="/dashboard/billing"
              className="mt-4 block w-full rounded-lg bg-purple-600 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-purple-500 transition-colors"
            >
              Manage Billing
            </a>
          </div>

          {/* Usage Stats */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Usage</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Team Members</span>
                  <span className="text-sm font-medium text-white">{teamSize}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800">
                  <div
                    className="h-1.5 rounded-full bg-purple-500"
                    style={{ width: `${Math.min(teamSize * 10, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Interview Templates</span>
                  <span className="text-sm font-medium text-white">{totalTemplates}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${Math.min(totalTemplates * 5, 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">Total Sessions</span>
                  <span className="text-sm font-medium text-white">{totalSessions}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-800">
                  <div
                    className="h-1.5 rounded-full bg-green-500"
                    style={{ width: `${Math.min(totalSessions * 2, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-xs text-gray-400 mb-4">
              These actions are irreversible. Please proceed with caution.
            </p>
            <button
              disabled
              className="w-full rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 opacity-50 cursor-not-allowed"
            >
              Delete Company (Contact Support)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
