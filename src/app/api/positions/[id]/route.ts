import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
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

    if (!user || !user.companyId || user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const position = await prisma.openPosition.findUnique({
      where: { id },
    });

    if (!position || position.companyId !== user.companyId) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, role, seniority, department, location, description, headcount, status } = body;

    const validStatuses = ["OPEN", "PAUSED", "CLOSED", "FILLED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const validSeniorities = ["JUNIOR", "MID", "SENIOR", "STAFF", "PRINCIPAL"];
    if (seniority && !validSeniorities.includes(seniority)) {
      return NextResponse.json(
        { error: `seniority must be one of: ${validSeniorities.join(", ")}` },
        { status: 400 }
      );
    }

    const updated = await prisma.openPosition.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(role !== undefined && { role }),
        ...(seniority !== undefined && { seniority }),
        ...(department !== undefined && { department }),
        ...(location !== undefined && { location }),
        ...(description !== undefined && { description }),
        ...(headcount !== undefined && { headcount: parseInt(headcount) }),
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/positions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
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

    if (!user || !user.companyId || user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const position = await prisma.openPosition.findUnique({
      where: { id },
    });

    if (!position || position.companyId !== user.companyId) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }

    await prisma.openPosition.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/positions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
