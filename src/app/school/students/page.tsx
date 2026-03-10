"use client";

import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  currentStreak: number;
  problemsSolved: number;
  lastActive: string | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/school/students")
      .then((r) => (r.ok ? r.json() : { students: [] }))
      .then((data) => {
        setStudents(data.students || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRemove = async (studentId: string) => {
    if (!confirm("Remove this student from the school?")) return;
    const res = await fetch(`/api/school/students?studentId=${studentId}`, { method: "DELETE" });
    if (res.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-2 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="mt-1 text-gray-500">{students.length} students enrolled</p>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No students enrolled yet. Share your enrollment code to get started.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">XP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Streak</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Solved</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{student.email}</td>
                  <td className="px-4 py-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron/10 text-[10px] font-bold text-saffron">
                      {student.level}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.xp.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">🔥 {student.currentStreak}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{student.problemsSolved}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {student.lastActive
                      ? new Date(student.lastActive).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(student.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
