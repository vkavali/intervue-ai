"use client";

import { useState, useEffect, useCallback } from "react";

interface StatusData {
  seeded: boolean;
  counts: Record<string, number>;
}

const QUICK_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard", roles: ["COMPANY_ADMIN", "INTERVIEWER"] },
  { label: "Interviews", href: "/dashboard/interviews", roles: ["COMPANY_ADMIN", "INTERVIEWER"] },
  { label: "Templates", href: "/dashboard/templates", roles: ["COMPANY_ADMIN"] },
  { label: "Sessions", href: "/dashboard/sessions", roles: ["COMPANY_ADMIN", "INTERVIEWER"] },
  { label: "Analytics", href: "/dashboard/analytics", roles: ["COMPANY_ADMIN"] },
  { label: "Positions", href: "/dashboard/positions", roles: ["COMPANY_ADMIN"] },
  { label: "Candidates", href: "/dashboard/candidates", roles: ["COMPANY_ADMIN"] },
  { label: "Interviewers", href: "/dashboard/interviewers", roles: ["COMPANY_ADMIN"] },
  { label: "Settings", href: "/dashboard/settings", roles: ["COMPANY_ADMIN"] },
  { label: "Candidate Dashboard", href: "/candidate", roles: ["CANDIDATE"] },
  { label: "Badges", href: "/candidate/badges", roles: ["CANDIDATE"] },
  { label: "Leaderboard", href: "/candidate/leaderboard", roles: ["CANDIDATE"] },
  { label: "Practice", href: "/practice", roles: ["CANDIDATE"] },
  { label: "Careers Page", href: "/careers", roles: ["ALL"] },
];

export default function DemoModePage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/test-mode/status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    }
  }, []);

  const fetchCurrentRole = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setCurrentRole(data.role);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchCurrentRole();
  }, [fetchStatus, fetchCurrentRole]);

  async function handleSeed() {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/test-mode/seed", { method: "POST" });
      const data = await res.json();
      if (data.alreadySeeded) {
        setActionMessage("Demo data already exists.");
      } else if (data.success) {
        setActionMessage("Demo data seeded successfully!");
      } else {
        setActionMessage(`Error: ${data.error || "Unknown error"}`);
      }
      await fetchStatus();
    } catch (e) {
      setActionMessage(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanup() {
    if (!confirm("This will delete all demo data and restore your original role. Continue?")) return;
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/test-mode/cleanup", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setActionMessage("Demo data cleaned up. Reloading...");
        await fetchStatus();
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionMessage(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      setActionMessage(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSwitchRole(role: string) {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/test-mode/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Switched to ${role}. Reloading...`);
        setTimeout(() => window.location.href = "/dashboard/test-mode", 500);
      } else {
        setActionMessage(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (e) {
      setActionMessage(`Error: ${e}`);
    } finally {
      setLoading(false);
    }
  }

  const isSeeded = status?.seeded ?? false;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demo Mode</h1>
        <p className="text-gray-600 mt-1">
          Seed realistic demo data to experience every page in the app. Switch roles to see Admin, Interviewer, and Candidate views.
        </p>
      </div>

      {/* Action Message */}
      {actionMessage && (
        <div className={`p-3 rounded-lg text-sm ${actionMessage.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {actionMessage}
        </div>
      )}

      {/* Seed / Cleanup Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isSeeded ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
            {isSeeded ? "Seeded" : "Not Seeded"}
          </span>
          {currentRole && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Current Role: {currentRole}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={loading || isSeeded}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? "Working..." : "Seed Demo Data"}
          </button>
          <button
            onClick={handleCleanup}
            disabled={loading || !isSeeded}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Clear Demo Data
          </button>
        </div>
      </div>

      {/* Role Switcher */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Role Switcher</h2>
        <p className="text-sm text-gray-500">
          Switch your role to experience different views. Your original role is stored and will be restored on cleanup.
        </p>
        <div className="flex gap-3">
          {(["COMPANY_ADMIN", "INTERVIEWER", "CANDIDATE"] as const).map((role) => (
            <button
              key={role}
              onClick={() => handleSwitchRole(role)}
              disabled={loading || currentRole === role}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                currentRole === role
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 cursor-default"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {role === "COMPANY_ADMIN" ? "Admin" : role === "INTERVIEWER" ? "Interviewer" : "Candidate"}
            </button>
          ))}
        </div>
      </div>

      {/* Data Counts */}
      {isSeeded && status?.counts && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Seeded Data</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(status.counts).map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="text-lg font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Quick Navigation</h2>
        <p className="text-sm text-gray-500">Jump to any area of the app to see demo data in action.</p>
        <div className="space-y-3">
          {["COMPANY_ADMIN", "INTERVIEWER", "CANDIDATE", "ALL"].map((roleGroup) => {
            const links = QUICK_NAV_LINKS.filter((l) => l.roles.includes(roleGroup));
            if (links.length === 0) return null;
            const label = roleGroup === "ALL" ? "Public" : roleGroup === "COMPANY_ADMIN" ? "Admin" : roleGroup === "INTERVIEWER" ? "Interviewer" : "Candidate";
            return (
              <div key={roleGroup}>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                <div className="flex flex-wrap gap-2">
                  {links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
