import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpProgressInLevel, getLevel } from "@/lib/gamification";
import Link from "next/link";
import SidebarGamification from "./SidebarGamification";

const sidebarLinks = [
  {
    href: "/candidate",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/candidate/interviews",
    label: "My Interviews",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: "/practice",
    label: "Practice Mode",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    href: "/candidate/career-kit",
    label: "AI Career Kit",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l1.75 4.25L18 9l-4.25 1.75L12 15l-1.75-4.25L6 9l4.25-1.75L12 3zm-7 13l.9 2.1L8 19l-2.1.9L5 22l-.9-2.1L2 19l2.1-.9L5 16zm14 0l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9L19 16z" />
      </svg>
    ),
  },
  {
    href: "/candidate/badges",
    label: "Badges",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    href: "/candidate/leaderboard",
    label: "Leaderboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: "/candidate/profile",
    label: "Profile",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/candidate");
  }

  // Redirect non-candidates to their own dashboard
  if (session.user.role !== "CANDIDATE") {
    redirect("/auth/redirect");
  }

  // Fetch gamification data for sidebar (graceful if columns don't exist yet)
  let xp = 0, currentStreak = 0, longestStreak = 0, isActiveToday = false;
  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { xp: true, level: true, currentStreak: true, longestStreak: true, lastActiveDate: true },
    });
    xp = user?.xp || 0;
    currentStreak = user?.currentStreak || 0;
    longestStreak = user?.longestStreak || 0;
    const lastActive = user?.lastActiveDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    isActiveToday = lastActive ? new Date(lastActive).toDateString() === today.toDateString() : false;
  } catch {
    // Gamification columns may not exist yet - use defaults
  }
  const level = getLevel(xp);
  const progress = xpProgressInLevel(xp);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        {/* Gamification widgets */}
        <SidebarGamification
          xp={xp}
          level={level}
          xpProgress={progress}
          currentStreak={currentStreak}
          longestStreak={longestStreak}
          isActiveToday={isActiveToday}
        />

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-lg border border-saffron/30 bg-saffron/5 p-4">
            <p className="text-xs font-medium text-saffron-dark">AI Career Kit</p>
            <p className="mt-1 text-sm text-gray-500">Turn verified practice into stronger hiring assets</p>
            <Link
              href="/candidate/career-kit"
              className="mt-2 block text-xs text-saffron hover:text-saffron-dark"
            >
              Build my career kit &rarr;
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
