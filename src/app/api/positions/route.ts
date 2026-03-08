import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

    if (user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const positions = await prisma.openPosition.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: "desc" },
    });

    // Get pipeline candidate counts per role+seniority
    const pipelineCounts = await prisma.candidatePipeline.groupBy({
      by: ["role", "seniority"],
      where: {
        companyId: user.companyId,
        stage: { notIn: ["REJECTED", "HIRED"] },
      },
      _count: { id: true },
    });

    const countMap: Record<string, number> = {};
    for (const pc of pipelineCounts) {
      countMap[`${pc.role}::${pc.seniority}`] = pc._count.id;
    }

    const positionsWithCounts = positions.map((p) => ({
      ...p,
      candidateCount: countMap[`${p.role}::${p.seniority}`] || 0,
    }));

    return NextResponse.json(positionsWithCounts);
  } catch (error) {
    console.error("GET /api/positions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

    if (!user || !user.companyId) {
      return NextResponse.json({ error: "User not found or no company" }, { status: 404 });
    }

    if (user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { title, role, seniority, department, location, description, headcount } = body;

    if (!title || !role || !seniority) {
      return NextResponse.json(
        { error: "title, role, and seniority are required" },
        { status: 400 }
      );
    }

    const validSeniorities = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
    if (!validSeniorities.includes(seniority)) {
      return NextResponse.json(
        { error: `seniority must be one of: ${validSeniorities.join(", ")}` },
        { status: 400 }
      );
    }

    const position = await prisma.openPosition.create({
      data: {
        companyId: user.companyId,
        title,
        role,
        seniority,
        department: department || null,
        location: location || null,
        description: description || null,
        headcount: headcount ? parseInt(headcount) : 1,
      },
    });

    return NextResponse.json(position, { status: 201 });
  } catch (error) {
    console.error("POST /api/positions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
