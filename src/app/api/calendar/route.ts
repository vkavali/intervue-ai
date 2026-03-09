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

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch scheduled sessions for this month
    const scheduledSessions = await prisma.interviewSession.findMany({
      where: {
        companyId: user.companyId,
        scheduledAt: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        template: { select: { id: true, title: true, role: true, seniority: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });

    // Fetch unscheduled sessions created this month
    const allCompanySessions = await prisma.interviewSession.findMany({
      where: {
        companyId: user.companyId,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        interviewer: { select: { id: true, name: true, email: true } },
        template: { select: { id: true, title: true, role: true, seniority: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    const unscheduledSessions = allCompanySessions.filter(s => !s.scheduledAt);
    const scheduledIds = new Set(scheduledSessions.map(s => s.id));
    const sessions = [...scheduledSessions, ...unscheduledSessions.filter(s => !scheduledIds.has(s.id))];

    // Fetch interviewer availability for this month
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
        date: { gte: startOfMonth, lte: endOfMonth },
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

// POST - Add interviewer availability
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "INTERVIEWER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, date, startTime, endTime } = await req.json();

    if (action === "addAvailability") {
      if (!date || !startTime || !endTime) {
        return NextResponse.json({ error: "date, startTime, endTime required" }, { status: 400 });
      }

      const slot = await prisma.interviewerAvailability.create({
        data: {
          interviewerId: user.id,
          date: new Date(date + "T00:00:00Z"),
          startTime,
          endTime,
        },
      });

      return NextResponse.json(slot, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/calendar error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Reschedule or update session status
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "INTERVIEWER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { sessionId, scheduledAt, status } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    // Verify session belongs to user's company
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
    });

    if (!interviewSession || interviewSession.companyId !== user.companyId) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (status) updateData.status = status;

    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/calendar error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Remove availability slot
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || (user.role !== "COMPANY_ADMIN" && user.role !== "INTERVIEWER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { availabilityId } = await req.json();

    if (!availabilityId) {
      return NextResponse.json({ error: "availabilityId required" }, { status: 400 });
    }

    // Verify ownership - admins can delete any, interviewers only their own
    const slot = await prisma.interviewerAvailability.findUnique({
      where: { id: availabilityId },
    });

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (user.role === "INTERVIEWER" && slot.interviewerId !== user.id) {
      return NextResponse.json({ error: "Cannot delete another interviewer's availability" }, { status: 403 });
    }

    await prisma.interviewerAvailability.delete({
      where: { id: availabilityId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/calendar error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
