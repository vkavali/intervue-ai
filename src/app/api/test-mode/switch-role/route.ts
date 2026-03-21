import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testModeEmail = process.env.TEST_MODE_EMAIL;
    if (testModeEmail) {
      if (session.user.email !== testModeEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = body as { role: string };

    if (!["COMPANY_ADMIN", "INTERVIEWER", "CANDIDATE"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find demo company
    const demoCompany = await prisma.company.findUnique({
      where: { slug: "demo-corp" },
      select: { id: true },
    });

    // Update user's role in the database
    const companyId = role === "CANDIDATE" ? null : (demoCompany?.id ?? null);
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role,
        companyId,
      },
    });

    // Store original role in cookie (only first time)
    const response = NextResponse.json({
      success: true,
      message: `Role switched to ${role}`,
      role,
    });

    const existingOriginalRole = req.cookies.get("demo-original-role")?.value;
    if (!existingOriginalRole) {
      response.cookies.set("demo-original-role", session.user.role, {
        path: "/",
        httpOnly: false,
        maxAge: 60 * 60 * 24, // 24 hours
      });
    }

    response.cookies.set("demo-mode", "active", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("POST /api/test-mode/switch-role error:", error);
    return NextResponse.json(
      { error: "Failed to switch role", details: String(error) },
      { status: 500 }
    );
  }
}
