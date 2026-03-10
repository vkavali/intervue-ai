"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const CandidateSessionView = dynamic(
  () => import("./CandidateSessionView"),
  { ssr: false }
);
const InterviewerSessionView = dynamic(
  () => import("./InterviewerSessionView"),
  { ssr: false }
);

interface SessionData {
  id: string;
  status: string;
  candidateId: string;
  interviewerId: string | null;
  companyId: string;
  currentQuestionIndex: number;
  code: string | null;
  language: string | null;
  aiLevel: number;
  startedAt: string | null;
  totalDurationMinutes: number | null;
  template: {
    title: string;
    role: string;
    seniority: string;
    interviewType?: string;
    defaultAiLevel: number;
    questions: {
      id: string;
      title: string;
      description: string;
      constraints: string | null;
      examples: string | null;
      difficulty: string;
      aiLevel: number;
      timeLimit: number;
      orderIndex: number;
      testCases: string | null;
      starterCode: string | null;
    }[];
  };
  candidate: { id: string; name: string; email: string };
  interviewer: { id: string; name: string; email: string } | null;
  aiInteractions: {
    id: string;
    prompt: string;
    response: string;
    aiLevel: number;
    timestamp: string;
  }[];
  interviewerNotes: {
    id: string;
    content: string;
    timestamp: string;
    interviewer: { name: string };
  }[];
}

interface CurrentUser {
  id: string;
  role: string;
  companyId: string | null;
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  // Fetch session data and current user
  useEffect(() => {
    async function fetchData() {
      try {
        const [sessionRes, userRes] = await Promise.all([
          fetch(`/api/sessions/${sessionId}`),
          fetch("/api/auth/me"),
        ]);

        if (!sessionRes.ok) {
          const data = await sessionRes.json().catch(() => ({}));
          setError(data.error || "Failed to load session");
          setLoading(false);
          return;
        }

        const session = await sessionRes.json();
        setSessionData(session);

        if (userRes.ok) {
          const user = await userRes.json();
          setCurrentUser(user);
        }

        setLoading(false);
      } catch {
        setError("Failed to load session");
        setLoading(false);
      }
    }
    fetchData();
  }, [sessionId]);

  // Start session handler (for candidates on PENDING sessions)
  async function handleStartSession() {
    if (starting) return;
    setStarting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSessionData((prev) =>
          prev
            ? {
                ...prev,
                status: updated.status || "ACTIVE",
                startedAt: updated.startedAt || new Date().toISOString(),
                totalDurationMinutes: updated.totalDurationMinutes || prev.totalDurationMinutes,
              }
            : prev
        );
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to start session");
      }
    } catch {
      setError("Failed to start session");
    } finally {
      setStarting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center">
          <svg
            className="animate-spin h-8 w-8 text-saffron mx-auto mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-gray-400">Loading session...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !sessionData) {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-red-400 text-lg mb-2">
            {error || "Session not found"}
          </p>
          <a
            href="/dashboard"
            className="text-sm text-saffron hover:text-saffron-light transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-2">Not authenticated</p>
          <a
            href="/auth/signin"
            className="text-sm text-saffron hover:text-saffron-light transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    );
  }

  // Determine user's role in this session
  const isCandidate = currentUser.id === sessionData.candidateId;
  const isInterviewer = currentUser.id === sessionData.interviewerId;
  const isAdmin =
    currentUser.role === "COMPANY_ADMIN" &&
    currentUser.companyId === sessionData.companyId;
  const isParticipant = isCandidate || isInterviewer || isAdmin;

  // Access denied
  if (!isParticipant) {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-16 w-16 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">
            You are not a participant in this interview session.
          </p>
          <a
            href="/dashboard"
            className="rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Session expired
  if (sessionData.status === "COMPLETED" || sessionData.status === "CANCELLED") {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">
            Session {sessionData.status === "COMPLETED" ? "Completed" : "Cancelled"}
          </h2>
          <p className="text-gray-400 mb-6">
            This interview session has ended.
          </p>
          <a
            href="/dashboard"
            className="rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Candidate on PENDING session - show waiting/start screen
  if (isCandidate && sessionData.status === "PENDING") {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center max-w-lg">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron via-white to-india-green mx-auto mb-6">
            <svg
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {sessionData.template.title}
          </h2>
          <p className="text-gray-400 mb-2">
            {sessionData.template.role} Interview
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {sessionData.template.questions.length} question
            {sessionData.template.questions.length !== 1 ? "s" : ""}
            {sessionData.totalDurationMinutes
              ? ` · ${sessionData.totalDurationMinutes} minutes`
              : ""}
          </p>

          <button
            onClick={handleStartSession}
            disabled={starting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-saffron via-white to-india-green px-8 py-3.5 text-lg font-semibold text-white transition-all hover:from-saffron-light hover:to-india-green-light disabled:opacity-50"
          >
            {starting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start Interview
              </>
            )}
          </button>

          <p className="mt-6 text-xs text-gray-600">
            Once started, the timer will begin and your session will be
            monitored.
          </p>
        </div>
      </div>
    );
  }

  // Interviewer / Admin on PENDING session - show waiting screen
  if ((isInterviewer || isAdmin) && sessionData.status === "PENDING") {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center max-w-lg">
          <svg
            className="mx-auto h-16 w-16 text-yellow-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">
            Waiting for Candidate
          </h2>
          <p className="text-gray-400 mb-2">
            {sessionData.candidate.name} has not started the session yet.
          </p>
          <p className="text-sm text-gray-500">
            {sessionData.template.title}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg bg-editor-surface px-4 py-2">
            <span className="animate-pulse h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-sm text-gray-400">
              Session is pending...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Check if session time has expired
  const isExpired =
    sessionData.startedAt &&
    sessionData.totalDurationMinutes &&
    new Date(sessionData.startedAt).getTime() +
      sessionData.totalDurationMinutes * 60 * 1000 <
      Date.now();

  if (isCandidate && isExpired && sessionData.status === "ACTIVE") {
    return (
      <div className="flex h-screen items-center justify-center bg-editor">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-16 w-16 text-red-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">
            Session Time Expired
          </h2>
          <p className="text-gray-400 mb-6">
            The allotted time for this interview session has ended. Your work has been saved.
          </p>
          <a
            href="/dashboard"
            className="rounded-lg border border-saffron bg-transparent px-4 py-2 text-sm font-medium text-saffron hover:bg-saffron/10 transition-colors"
          >
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Active session - route by role
  // Check interviewer/admin FIRST to prevent admins from seeing candidate start button
  if (isInterviewer || isAdmin) {
    return (
      <InterviewerSessionView
        sessionData={sessionData}
        sessionId={sessionId}
        userId={currentUser.id}
        isActualInterviewer={isInterviewer || (isAdmin && currentUser.id === sessionData.interviewerId)}
      />
    );
  }

  if (isCandidate) {
    return (
      <CandidateSessionView
        sessionData={sessionData}
        sessionId={sessionId}
        userId={currentUser.id}
      />
    );
  }

  // Fallback
  return (
    <InterviewerSessionView
      sessionData={sessionData}
      sessionId={sessionId}
      userId={currentUser.id}
      isActualInterviewer={false}
    />
  );
}
