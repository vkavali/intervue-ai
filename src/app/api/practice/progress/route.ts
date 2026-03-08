import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/practice/progress - Get all practice progress for user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const progress = await prisma.practiceProgress.findMany({
      where: { userId: user.id },
      orderBy: { lastSavedAt: "desc" },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("GET /api/practice/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/practice/progress - Save or update practice progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      problemId,
      bankProblemId,
      code,
      language,
      status,
      timeSpentSeconds,
    } = body;

    if (!problemId && !bankProblemId) {
      return NextResponse.json(
        { error: "Either problemId or bankProblemId is required" },
        { status: 400 }
      );
    }

    // Validate code length
    if (code && code.length > 50000) {
      return NextResponse.json(
        { error: "Code exceeds maximum length" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["IN_PROGRESS", "COMPLETED", "ABANDONED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Upsert based on unique constraint
    const where = problemId
      ? { userId_problemId: { userId: user.id, problemId } }
      : { userId_bankProblemId: { userId: user.id, bankProblemId } };

    const data = {
      code: code || null,
      language: language || null,
      status: status || "IN_PROGRESS",
      timeSpentSeconds: timeSpentSeconds || 0,
      lastSavedAt: new Date(),
    };

    const progress = await prisma.practiceProgress.upsert({
      where,
      create: {
        userId: user.id,
        problemId: problemId || null,
        bankProblemId: bankProblemId || null,
        ...data,
      },
      update: data,
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("POST /api/practice/progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
