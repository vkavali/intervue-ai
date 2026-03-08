import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || !user.companyId) {
      return NextResponse.json({ error: "User not found or no company" }, { status: 404 });
    }

    if (user.role !== "COMPANY_ADMIN" && user.role !== "INTERVIEWER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

    // Build date range for the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch sessions scheduled in this month for the company
    const sessions = await prisma.interviewSession.findMany({
      where: {
        companyId: user.companyId,
        scheduledAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        template: { select: { id: true, title: true, role: true, seniority: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Fetch interviewer availability for this month (scoped to company)
    const companyInterviewers = await prisma.user.findMany({
      where: {
        companyId: user.companyId,
        role: { in: ["INTERVIEWER", "COMPANY_ADMIN"] },
      },
      select: { id: true },
    });
    const interviewerIds = companyInterviewers.map((i) => i.id);

    const availability = await prisma.interviewerAvailability.findMany({
      where: {
        interviewerId: { in: interviewerIds },
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        interviewer: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ sessions, availability });
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
