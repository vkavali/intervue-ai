import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail } = await req.json();
    const email = rawEmail?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error("NEXTAUTH_SECRET not set — cannot generate reset token");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Generate a JWT reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { email: user.email, purpose: "password-reset" },
      secret,
      { expiresIn: "1h" }
    );

    const baseUrl = process.env.NEXTAUTH_URL || req.nextUrl.origin;
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    // Send the email
    const emailSent = await sendPasswordResetEmail(email, resetUrl);

    if (!emailSent) {
      // Log for server-side debugging (visible in Railway logs)
      console.log(`[Password Reset] Email send failed. Manual link for ${email}: ${resetUrl}`);
    }

    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
      // Include reset URL in development for convenience
      ...(process.env.NODE_ENV !== "production" && { resetUrl }),
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
