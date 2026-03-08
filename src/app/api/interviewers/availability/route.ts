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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const interviewerId = searchParams.get("interviewerId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build filter conditions
    const where: {
      interviewerId?: string;
      date?: { gte?: Date; lte?: Date };
    } = {};

    // If a specific interviewer is requested, use that; otherwise scope to the
    // requesting user's company interviewers (admins can see all, interviewers see own)
    if (interviewerId) {
      where.interviewerId = interviewerId;
    } else if (user.role === "INTERVIEWER") {
      // Interviewers can only see their own availability
      where.interviewerId = user.id;
    }
    // COMPANY_ADMIN can see all if no interviewerId is specified

    // Date range filtering
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // For company admins, further scope to only interviewers in their company
    let interviewerIds: string[] | undefined;
    if (!interviewerId && user.role === "COMPANY_ADMIN" && user.companyId) {
      const companyInterviewers = await prisma.user.findMany({
        where: {
          companyId: user.companyId,
          role: { in: ["INTERVIEWER", "COMPANY_ADMIN"] },
        },
        select: { id: true },
      });
      interviewerIds = companyInterviewers.map((i) => i.id);
    }

    const availability = await prisma.interviewerAvailability.findMany({
      where: {
        ...where,
        ...(interviewerIds ? { interviewerId: { in: interviewerIds } } : {}),
      },
      include: {
        interviewer: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("GET /api/interviewers/availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Only interviewers or admins can create availability
    if (user.role !== "INTERVIEWER" && user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only interviewers or admins can create availability slots" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { date, startTime, endTime } = body;

    if (!date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "date, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    // Validate time format (HH:mm)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "startTime and endTime must be in HH:mm format" },
        { status: 400 }
      );
    }

    // Validate startTime is before endTime
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "startTime must be before endTime" },
        { status: 400 }
      );
    }

    // Validate date is a valid date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      );
    }

    const availability = await prisma.interviewerAvailability.create({
      data: {
        interviewerId: user.id,
        date: parsedDate,
        startTime,
        endTime,
      },
      include: {
        interviewer: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error("POST /api/interviewers/availability error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
