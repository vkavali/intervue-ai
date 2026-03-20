import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// POST /api/razorpay/verify — Verify Razorpay payment signature
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      include: { company: true },
    })

    if (!user || !user.companyId || !user.company) {
      return NextResponse.json(
        { error: "User must belong to a company" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
      planKey,
    } = body as {
      razorpay_payment_id: string
      razorpay_subscription_id: string
      razorpay_signature: string
      planKey: string
    }

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment verification fields" },
        { status: 400 }
      )
    }

    // Verify HMAC signature
    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay not configured" },
        { status: 503 }
      )
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex")

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Map planKey to DB plan name
    const planMap: Record<string, string> = {
      PRO: "GROWTH",
      ENTERPRISE: "ENTERPRISE",
      EDUCATION: "EDUCATION",
    }

    const dbPlan = planMap[planKey] || "STARTER"

    // Update company plan
    await prisma.company.update({
      where: { id: user.companyId },
      data: {
        plan: dbPlan,
        razorpaySubscriptionId: razorpay_subscription_id,
        paymentGateway: "razorpay",
      },
    })

    return NextResponse.json({ success: true, plan: dbPlan })
  } catch (error) {
    console.error("POST /api/razorpay/verify error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
