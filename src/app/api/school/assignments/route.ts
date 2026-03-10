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
    });

    if (!school) {
      return NextResponse.json({ error: "School not found" }, { status: 404 });
    }

    const assignments = await prisma.schoolAssignment.findMany({
      where: { schoolId: school.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      assignments: assignments.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        problemIds: JSON.parse(a.problemIds),
        dueDate: a.dueDate?.toISOString() || null,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/school/assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
    const { title, description, problemIds, dueDate } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const assignment = await prisma.schoolAssignment.create({
      data: {
        schoolId: school.id,
        title,
        description: description || null,
        problemIds: JSON.stringify(problemIds || []),
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        problemIds: JSON.parse(assignment.problemIds),
        dueDate: assignment.dueDate?.toISOString() || null,
        createdAt: assignment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/school/assignments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
