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

    const school = await prisma.school.findFirst({
      where: { adminId: session.user.id },
      include: {
        _count: { select: { students: true } },
      },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    return NextResponse.json({
      enrollmentCode: school.enrollmentCode,
      maxStudents: school.maxStudents,
      currentStudents: school._count.students,
    });
  } catch (error) {
    console.error("GET /api/school/enrollment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "SCHOOL_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const school = await prisma.school.findFirst({
      where: { adminId: session.user.id },
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.regenerate) {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const updated = await prisma.school.update({
        where: { id: school.id },
        data: { enrollmentCode: newCode },
      });
      return NextResponse.json({ enrollmentCode: updated.enrollmentCode });
    }

    if (body.maxStudents !== undefined) {
      const max = Math.max(1, Math.min(10000, Number(body.maxStudents)));
      await prisma.school.update({
        where: { id: school.id },
        data: { maxStudents: max },
      });
      return NextResponse.json({ maxStudents: max });
    }

    return NextResponse.json({ error: "No valid update" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/school/enrollment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
