import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/practice/saved/:id - Get a single saved practice problem by ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const problem = await prisma.practiceProblem.findFirst({
      where: { id, userId: user.id },
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

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    const formatted = {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      constraints: problem.constraints,
      examples: problem.examples,
      tags: JSON.parse(problem.tags),
      starterCode: problem.starterCode ? JSON.parse(problem.starterCode) : null,
      company: problem.company,
      role: problem.role,
      createdAt: problem.createdAt,
      progress: problem.progress[0] || null,
    };

    return NextResponse.json({ problem: formatted });
  } catch (error) {
    console.error("GET /api/practice/saved/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
