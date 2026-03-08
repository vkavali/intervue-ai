"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import NotificationBell from "./NotificationBell"

const roleBadgeColors: Record<string, string> = {
  COMPANY_ADMIN: "bg-purple-600",
  INTERVIEWER: "bg-blue-600",
  CANDIDATE: "bg-green-600",
}

const roleBadgeLabels: Record<string, string> = {
  COMPANY_ADMIN: "Admin",
  INTERVIEWER: "Interviewer",
  CANDIDATE: "Candidate",
}

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 text-white shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">
              Intervue<span className="text-blue-400">.AI</span>
            </span>
          </Link>

          {/* Right: Auth actions */}
          <div className="flex items-center gap-4">
            {status === "loading" && (
              <div className="h-5 w-24 animate-pulse rounded bg-gray-700" />
            )}

            {status === "authenticated" && session?.user && (
              <>
                <Link
                  href={
                    session.user.role === "CANDIDATE"
                      ? "/candidate"
                      : "/dashboard"
                  }
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  Dashboard
                </Link>

                {session.user.role === "CANDIDATE" && (
                  <Link
                    href="/practice"
                    className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                  >
                    Practice
                  </Link>
                )}

                <span className="text-sm text-gray-300">
                  {session.user.name || session.user.email}
                </span>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${
                    roleBadgeColors[session.user.role] || "bg-gray-600"
                  }`}
                >
                  {roleBadgeLabels[session.user.role] || session.user.role}
                </span>

                {(session.user.role === "COMPANY_ADMIN" ||
                  session.user.role === "INTERVIEWER") && (
                  <NotificationBell />
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-md bg-gray-700 px-3 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-600 hover:text-white"
                >
                  Sign Out
                </button>
              </>
            )}

            {status === "unauthenticated" && (
              <>
                <Link
                  href="/auth/signin"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
