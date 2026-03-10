import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SchoolDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SCHOOL_ADMIN") {
    redirect("/auth/redirect");
  }

  let school: {
    name: string;
    enrollmentCode: string;
    maxStudents: number;
    students: {
      id: string;
      name: string | null;
      xp: number;
      level: number;
      currentStreak: number;
      lastActiveDate: Date | null;
      _count: { practiceProgress: number };
    }[];
  } | null = null;

  try {
    school = await prisma.school.findFirst({
      where: { adminId: session.user.id },
      include: {
        students: {
          select: {
            id: true,
            name: true,
            xp: true,
            level: true,
            currentStreak: true,
            lastActiveDate: true,
            _count: {
              select: { practiceProgress: { where: { status: "COMPLETED" } } },
            },
          },
          orderBy: { xp: "desc" },
        },
      },
    });
  } catch {
    // Gamification columns may not exist yet — fall back to basic query
    try {
      const basicSchool = await prisma.school.findFirst({
        where: { adminId: session.user.id },
        select: { name: true, enrollmentCode: true, maxStudents: true },
      });
      if (basicSchool) {
        school = { ...basicSchool, students: [] };
      }
    } catch {
      // School table itself may not exist
    }
  }

  if (!school) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">School not found. Please contact support.</p>
      </div>
    );
  }

  const totalStudents = school.students.length;
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const activeThisWeek = school.students.filter(
    (s) => s.lastActiveDate && new Date(s.lastActiveDate) >= oneWeekAgo
  ).length;
  const avgProblems = totalStudents > 0
    ? Math.round(school.students.reduce((sum, s) => sum + s._count.practiceProgress, 0) / totalStudents)
    : 0;
  const avgLevel = totalStudents > 0
    ? Math.round(school.students.reduce((sum, s) => sum + s.level, 0) / totalStudents * 10) / 10
    : 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
        <p className="mt-1 text-gray-500">School administration dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalStudents}</p>
          <p className="mt-1 text-xs text-gray-500">of {school.maxStudents} max</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active This Week</p>
          <p className="mt-2 text-3xl font-bold text-green-500">{activeThisWeek}</p>
          <p className="mt-1 text-xs text-gray-500">students</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Problems Solved</p>
          <p className="mt-2 text-3xl font-bold text-saffron">{avgProblems}</p>
          <p className="mt-1 text-xs text-gray-500">per student</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Level</p>
          <p className="mt-2 text-3xl font-bold text-india-green">{avgLevel}</p>
          <p className="mt-1 text-xs text-gray-500">across all students</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/school/enrollment"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-pink-300 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-900">Invite Students</h3>
          <p className="text-xs text-gray-500 mt-1">Share enrollment code or send invites</p>
          <p className="mt-2 text-xs text-pink-500">Code: {school.enrollmentCode}</p>
        </Link>
        <Link
          href="/school/assignments"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-pink-300 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-900">Create Assignment</h3>
          <p className="text-xs text-gray-500 mt-1">Assign practice problems to students</p>
        </Link>
        <Link
          href="/school/analytics"
          className="rounded-xl border border-gray-200 bg-white p-5 hover:border-pink-300 transition-colors"
        >
          <h3 className="text-sm font-semibold text-gray-900">View Analytics</h3>
          <p className="text-xs text-gray-500 mt-1">Track class-wide progress and performance</p>
        </Link>
      </div>

      {/* Top Students */}
      {school.students.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Students</h2>
            <Link href="/school/students" className="text-xs text-pink-500 hover:text-pink-600">
              View All &rarr;
            </Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">XP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Streak</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Solved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {school.students.slice(0, 10).map((student, i) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/10 text-[10px] font-bold text-saffron">
                        {student.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student.xp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      🔥 {student.currentStreak}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{student._count.practiceProgress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {school.students.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <div className="text-4xl mb-4">🎓</div>
          <h3 className="text-lg font-semibold text-gray-900">No Students Yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Share your enrollment code <span className="font-mono font-bold text-pink-500">{school.enrollmentCode}</span> with students to get started.
          </p>
          <Link
            href="/school/enrollment"
            className="mt-4 inline-block rounded-lg border border-pink-400 px-4 py-2 text-sm font-medium text-pink-500 hover:bg-pink-50 transition-colors"
          >
            Manage Enrollment
          </Link>
        </div>
      )}
    </div>
  );
}
