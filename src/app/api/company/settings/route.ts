import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
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
        { error: "Only company admins can update settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, logo } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    await prisma.company.update({
      where: { id: user.companyId },
      data: {
        name: name.trim(),
        logo: logo || null,
      },
    });

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("PUT /api/company/settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
