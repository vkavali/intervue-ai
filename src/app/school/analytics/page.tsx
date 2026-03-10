import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function SchoolAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "SCHOOL_ADMIN") {
    redirect("/auth/redirect");
  }

  const school = await prisma.school.findFirst({
    where: { adminId: session.user.id },
    include: {
      students: {
        select: {
          id: true,
          name: true,
          xp: true,
          level: true,
          currentStreak: true,
          longestStreak: true,
          practiceProgress: {
            select: { status: true, timeSpentSeconds: true },
          },
          practiceSubmissions: {
            select: { status: true, submittedAt: true },
          },
        },
      },
    },
  });

  if (!school) {
    return <div className="text-center py-16"><p className="text-gray-500">School not found.</p></div>;
  }

  const students = school.students;
  const totalStudents = students.length;

  // Aggregate stats
  const totalSolved = students.reduce(
    (sum, s) => sum + s.practiceProgress.filter((p) => p.status === "COMPLETED").length,
    0
  );
  const totalTime = students.reduce(
    (sum, s) => sum + s.practiceProgress.reduce((ps, p) => ps + p.timeSpentSeconds, 0),
    0
  );
  const totalXP = students.reduce((sum, s) => sum + s.xp, 0);
  const avgLevel = totalStudents > 0
    ? (students.reduce((sum, s) => sum + s.level, 0) / totalStudents).toFixed(1)
    : "0";

  // Per-student breakdown sorted by XP
  const breakdown = students
    .map((s) => ({
      name: s.name,
      level: s.level,
      xp: s.xp,
      streak: s.currentStreak,
      bestStreak: s.longestStreak,
      solved: s.practiceProgress.filter((p) => p.status === "COMPLETED").length,
      inProgress: s.practiceProgress.filter((p) => p.status === "IN_PROGRESS").length,
      timeMinutes: Math.round(
        s.practiceProgress.reduce((sum, p) => sum + p.timeSpentSeconds, 0) / 60
      ),
    }))
    .sort((a, b) => b.xp - a.xp);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-gray-500">Class-wide progress and performance insights.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Problems Solved</p>
          <p className="mt-2 text-3xl font-bold text-india-green">{totalSolved}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Total Practice Time</p>
          <p className="mt-2 text-3xl font-bold text-saffron">
            {totalTime >= 3600
              ? `${Math.floor(totalTime / 3600)}h`
              : `${Math.floor(totalTime / 60)}m`}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Total XP Earned</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalXP.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-xs font-medium text-gray-500 uppercase">Average Level</p>
          <p className="mt-2 text-3xl font-bold text-pink-500">{avgLevel}</p>
        </div>
      </div>

      {/* Per-Student Breakdown */}
      {breakdown.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Student Breakdown</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">XP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Solved</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">In Progress</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Streak</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Best Streak</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {breakdown.map((s) => (
                <tr key={s.name} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/10 text-[10px] font-bold text-saffron">
                      {s.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{s.xp.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-500 font-medium">{s.solved}</td>
                  <td className="px-4 py-3 text-sm text-yellow-500">{s.inProgress}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">🔥 {s.streak}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.bestStreak}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {s.timeMinutes >= 60
                      ? `${Math.floor(s.timeMinutes / 60)}h ${s.timeMinutes % 60}m`
                      : `${s.timeMinutes}m`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No student data yet.</p>
        </div>
      )}
    </div>
  );
}
