import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserUsageStats } from "@/lib/rate-limiter";

// GET /api/usage - Get current user's rate limit usage stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const plan = user.company?.plan || null;
    const stats = getUserUsageStats(user.id, plan);

    return NextResponse.json({
      plan: plan || "FREE",
      usage: stats,
    });
  } catch (error) {
    console.error("GET /api/usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
