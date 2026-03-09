import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/practice/community/[bankProblemId] - Get community solutions
// Gated: only visible to users who have COMPLETED this problem
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bankProblemId: string }> }
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

    const { bankProblemId } = await params;

    // Check if user has completed this problem
    const progress = await prisma.practiceProgress.findUnique({
      where: {
        userId_bankProblemId: {
          userId: user.id,
          bankProblemId,
        },
      },
      select: { status: true },
    });

    if (!progress || progress.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "You must complete this problem to view community solutions" },
        { status: 403 }
      );
    }

    const solutions = await prisma.communitySubmission.findMany({
      where: { bankProblemId },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: { submittedAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      solutions: solutions.map((s) => ({
        id: s.id,
        code: s.code,
        language: s.language,
        username: s.user.name,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error) {
    console.error("GET /api/practice/community/[bankProblemId] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
