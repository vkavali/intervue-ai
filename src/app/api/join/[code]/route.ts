import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Validate enrollment code and return school name
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const school = await prisma.school.findUnique({
      where: { enrollmentCode: code },
      include: { _count: { select: { students: true } } },
    });

    if (!school) {
      return NextResponse.json({ error: "Invalid enrollment code" }, { status: 404 });
    }

    if (school._count.students >= school.maxStudents) {
      return NextResponse.json({ error: "This school has reached its student capacity" }, { status: 400 });
    }

    return NextResponse.json({ schoolName: school.name });
  } catch (error) {
    console.error("GET /api/join/[code] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Join school (authenticated candidate)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;

    const school = await prisma.school.findUnique({
      where: { enrollmentCode: code },
      include: { _count: { select: { students: true } } },
    });

    if (!school) {
      return NextResponse.json({ error: "Invalid enrollment code" }, { status: 404 });
    }

    if (school._count.students >= school.maxStudents) {
      return NextResponse.json({ error: "School is full" }, { status: 400 });
    }

    // Link user to school
    await prisma.user.update({
      where: { id: session.user.id },
      data: { schoolId: school.id },
    });

    return NextResponse.json({ success: true, schoolName: school.name });
  } catch (error) {
    console.error("POST /api/join/[code] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
