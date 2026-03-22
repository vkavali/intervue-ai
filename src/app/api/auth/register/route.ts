import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifyTurnstile } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email: rawEmail, password, role, companyName, schoolName, turnstileToken, website } = body;
    const email = rawEmail?.toLowerCase().trim();

    // Honeypot — bots fill invisible fields; silently return success
    if (website) {
      return NextResponse.json({ user: { id: "ok" } }, { status: 201 });
    }

    // Turnstile bot verification
    if (turnstileToken && !(await verifyTurnstile(turnstileToken))) {
      return NextResponse.json(
        { error: "Bot verification failed. Please try again." },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["COMPANY_ADMIN", "INTERVIEWER", "CANDIDATE", "SCHOOL_ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be COMPANY_ADMIN, INTERVIEWER, CANDIDATE, or SCHOOL_ADMIN" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if COMPANY_ADMIN has provided a company name
    if (role === "COMPANY_ADMIN" && !companyName) {
      return NextResponse.json(
        { error: "Company name is required for Company Admin role" },
        { status: 400 }
      );
    }

    // Check if SCHOOL_ADMIN has provided a school name
    if (role === "SCHOOL_ADMIN" && !schoolName) {
      return NextResponse.json(
        { error: "Institution name is required for School Admin role" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // If COMPANY_ADMIN, create company first then user
    if (role === "COMPANY_ADMIN") {
      const company = await prisma.company.create({
        data: {
          name: companyName,
          plan: "STARTER",
        },
      });

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          companyId: company.id,
        },
      });

      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
          },
        },
        { status: 201 }
      );
    }

    // If SCHOOL_ADMIN, create school and link admin
    if (role === "SCHOOL_ADMIN") {
      // Generate 6-char enrollment code
      const enrollmentCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      await prisma.school.create({
        data: {
          name: schoolName,
          enrollmentCode,
          adminId: user.id,
        },
      });

      return NextResponse.json(
        {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
        { status: 201 }
      );
    }

    // For INTERVIEWER and CANDIDATE, create user without company
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
