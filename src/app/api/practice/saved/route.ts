import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/practice/saved - Get user's saved/generated practice problems
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

    const problems = await prisma.practiceProblem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        progress: {
          where: { userId: user.id },
          select: {
            status: true,
            timeSpentSeconds: true,
            lastSavedAt: true,
            language: true,
          },
        },
      },
    });

    const formatted = problems.map((p) => ({
      id: p.id,
      title: p.title,
      difficulty: p.difficulty,
      description: p.description,
      constraints: p.constraints,
      examples: p.examples,
      tags: JSON.parse(p.tags),
      starterCode: p.starterCode ? JSON.parse(p.starterCode) : null,
      company: p.company,
      role: p.role,
      createdAt: p.createdAt,
      progress: p.progress[0] || null,
    }));

    return NextResponse.json({ problems: formatted });
  } catch (error) {
    console.error("GET /api/practice/saved error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/practice/saved - Delete a saved practice problem
export async function DELETE(req: NextRequest) {
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

    const { problemId } = await req.json();
    if (!problemId) {
      return NextResponse.json(
        { error: "problemId is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const problem = await prisma.practiceProblem.findFirst({
      where: { id: problemId, userId: user.id },
    });
    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // Delete associated progress first, then the problem
    await prisma.practiceProgress.deleteMany({
      where: { problemId },
    });
    await prisma.practiceProblem.delete({
      where: { id: problemId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/practice/saved error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
