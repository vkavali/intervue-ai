"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import NotificationBell from "./NotificationBell"
import Logo from "./Logo"

const roleBadgeColors: Record<string, string> = {
  COMPANY_ADMIN: "border-saffron text-saffron-dark bg-saffron/10",
  INTERVIEWER: "border-india-green text-india-green-dark bg-india-green/10",
  CANDIDATE: "border-india-green text-india-green-dark bg-india-green/10",
  SCHOOL_ADMIN: "border-pink-400 text-pink-600 bg-pink-50",
}

const roleBadgeLabels: Record<string, string> = {
  COMPANY_ADMIN: "Admin",
  INTERVIEWER: "Interviewer",
  CANDIDATE: "Candidate",
  SCHOOL_ADMIN: "School",
}

export default function Navbar() {
  const { data: session, status } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <Logo size="lg" />

          {/* Right: Auth actions */}
          <div className="flex items-center gap-4">
            {status === "loading" && (
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            )}

            {status === "authenticated" && session?.user && (
              <>
                <Link
                  href={
                    session.user.role === "CANDIDATE"
                      ? "/candidate"
                      : session.user.role === "SCHOOL_ADMIN"
                        ? "/school"
                        : "/dashboard"
                  }
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Dashboard
                </Link>

                {session.user.role === "CANDIDATE" && (
                  <>
                    <Link
                      href="/careers"
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      Careers
                    </Link>
                    <Link
                      href="/practice"
                      className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                      Practice
                    </Link>
                  </>
                )}

                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    roleBadgeColors[session.user.role] || "border-gray-300 text-gray-500 bg-gray-100"
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
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </>
            )}

            {status === "unauthenticated" && (
              <>
                <Link
                  href="/careers"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Careers
                </Link>
                <Link
                  href="/auth/signin"
                  className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-md border border-india-green bg-transparent px-3 py-1.5 text-sm font-medium text-india-green-dark transition-colors hover:bg-india-green/10"
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
