"use client";

import { useState, useEffect, useCallback } from "react";

export default function DemoFloatingToolbar() {
  const [visible, setVisible] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const checkDemoMode = useCallback(() => {
    // Check for demo-mode cookie
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const hasDemoCookie = cookies.some((c) => c.startsWith("demo-mode=active"));
    setVisible(hasDemoCookie);
  }, []);

  const fetchRole = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setCurrentRole(data.role);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    checkDemoMode();
    fetchRole();
  }, [checkDemoMode, fetchRole]);

  async function handleSwitch(role: string) {
    setSwitching(true);
    try {
      await fetch("/api/test-mode/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      // Reload to apply new role
      window.location.reload();
    } catch {
      setSwitching(false);
    }
  }

  async function handleExit() {
    setSwitching(true);
    try {
      await fetch("/api/test-mode/cleanup", { method: "POST" });
      window.location.href = "/dashboard/test-mode";
    } catch {
      setSwitching(false);
    }
  }

  if (!visible) return null;

  const roleLabel = currentRole === "COMPANY_ADMIN" ? "Admin" : currentRole === "INTERVIEWER" ? "Interviewer" : currentRole === "CANDIDATE" ? "Candidate" : currentRole;

  const roles = [
    { key: "COMPANY_ADMIN", label: "Admin" },
    { key: "INTERVIEWER", label: "Interviewer" },
    { key: "CANDIDATE", label: "Candidate" },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white rounded-full shadow-lg px-4 py-2 flex items-center gap-3 text-sm">
      <span className="font-semibold text-indigo-300">Demo Mode</span>
      <span className="text-gray-400">|</span>
      <span className="text-gray-300">Role: <strong>{roleLabel}</strong></span>
      <span className="text-gray-400">|</span>
      {roles
        .filter((r) => r.key !== currentRole)
        .map((r) => (
          <button
            key={r.key}
            onClick={() => handleSwitch(r.key)}
            disabled={switching}
            className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
          >
            {r.label}
          </button>
        ))}
      <span className="text-gray-400">|</span>
      <button
        onClick={handleExit}
        disabled={switching}
        className="px-2.5 py-1 bg-red-600 hover:bg-red-500 rounded-full text-xs font-medium transition-colors disabled:opacity-50"
      >
        Exit Demo
      </button>
    </div>
  );
}
