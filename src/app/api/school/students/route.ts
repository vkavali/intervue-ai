import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let school: { students: { id: string; name: string | null; email: string | null; level: number; xp: number; currentStreak: number; lastActiveDate: Date | null; _count: { practiceProgress: number } }[] } | null = null;

    try {
      school = await prisma.school.findFirst({
        where: { adminId: session.user.id },
        include: {
          students: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              xp: true,
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
      // Gamification columns may not exist — fall back to basic query
      try {
        const basicSchool = await prisma.school.findFirst({
          where: { adminId: session.user.id },
          include: {
            students: {
              select: { id: true, name: true, email: true },
            },
          },
        });
        if (basicSchool) {
          school = {
            students: basicSchool.students.map((s) => ({
              ...s,
              level: 1,
              xp: 0,
              currentStreak: 0,
              lastActiveDate: null,
              _count: { practiceProgress: 0 },
            })),
          };
        }
      } catch {
        // School table may not exist
      }
    }

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const students = school.students.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      level: s.level,
      xp: s.xp,
      currentStreak: s.currentStreak,
      problemsSolved: s._count.practiceProgress,
      lastActive: s.lastActiveDate?.toISOString() || null,
    }));

    return NextResponse.json({ students });
  } catch (error) {
    console.error("GET /api/school/students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    const school = await prisma.school.findFirst({
      where: { adminId: session.user.id },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    // Verify student belongs to this school
    const student = await prisma.user.findFirst({
      where: { id: studentId, schoolId: school.id },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found in school" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: studentId },
      data: { schoolId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/school/students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
