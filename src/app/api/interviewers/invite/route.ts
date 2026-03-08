import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== "COMPANY_ADMIN" || !user.companyId) {
      return NextResponse.json(
        { error: "Only company admins can invite interviewers" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.companyId === user.companyId) {
        return NextResponse.json(
          { error: "This user is already in your company" },
          { status: 400 }
        );
      }
      // Update existing user to join this company as interviewer
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          companyId: user.companyId,
          role: "INTERVIEWER",
        },
      });

      return NextResponse.json({ message: "Interviewer added successfully" });
    }

    // Create new interviewer user with temporary password
    const tempPassword = await bcrypt.hash("changeme123", 10);
    await prisma.user.create({
      data: {
        email,
        name,
        password: tempPassword,
        role: "INTERVIEWER",
        companyId: user.companyId,
      },
    });

    return NextResponse.json(
      { message: "Interviewer invited successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/interviewers/invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
