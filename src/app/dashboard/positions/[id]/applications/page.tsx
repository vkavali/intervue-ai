"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  coverLetter: string | null;
  linkedinUrl: string | null;
  status: string;
  createdAt: string;
}

interface PositionInfo {
  id: string;
  title: string;
  role: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  NEW: { label: "New", color: "bg-blue-500/10 text-blue-500 border-blue-500/30" },
  REVIEWING: { label: "Reviewing", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-india-green/10 text-india-green border-india-green/30" },
  REJECTED: { label: "Rejected", color: "bg-accent-red/10 text-accent-red border-accent-red/30" },
  HIRED: { label: "Hired", color: "bg-green-500/10 text-green-400 border-green-500/30" },
};

export default function ApplicationsPage() {
  const params = useParams();
  const positionId = params.id as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [position, setPosition] = useState<PositionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/positions/${positionId}/applications`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setPosition(data.position || null);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [positionId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (appId: string, status: string) => {
    try {
      const res = await fetch(`/api/positions/${positionId}/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchApplications();
      }
    } catch {
      // silently fail
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/positions" className="text-sm text-gray-500 hover:text-saffron">
          &larr; Back to Positions
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Applications {position ? `for ${position.title}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {applications.length} application{applications.length !== 1 ? "s" : ""} received
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="h-8 w-8 animate-spin text-saffron" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center">
          <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-2 text-sm text-gray-500">Share your public job board to receive applications.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Applied</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Links</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app) => {
                const sc = statusConfig[app.status] || statusConfig.NEW;
                return (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{app.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{app.email}</div>
                      {app.phone && <div className="text-xs text-gray-400">{app.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${sc.color}`}>
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {app.resumeUrl && (
                          <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-saffron hover:text-saffron-dark">
                            Resume
                          </a>
                        )}
                        {app.linkedinUrl && (
                          <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-400">
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1 text-xs text-gray-900 focus:border-saffron focus:outline-none"
                        >
                          <option value="NEW">New</option>
                          <option value="REVIEWING">Reviewing</option>
                          <option value="SHORTLISTED">Shortlisted</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="HIRED">Hired</option>
                        </select>
                        <Link
                          href={`/dashboard/candidates/add?name=${encodeURIComponent(app.name)}&email=${encodeURIComponent(app.email)}`}
                          className="rounded px-2 py-1 text-xs font-medium text-india-green hover:bg-india-green/10"
                        >
                          Add to Pipeline
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
