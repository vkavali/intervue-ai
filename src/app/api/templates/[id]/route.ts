import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user?.companyId) {
      return NextResponse.json({ error: "Not in a company" }, { status: 403 });
    }

    const template = await prisma.interviewTemplate.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        role: true,
        seniority: true,
        roundType: true,
        defaultAiLevel: true,
        companyId: true,
      },
    });

    if (!template || template.companyId !== user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("GET /api/templates/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
