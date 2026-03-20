import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { razorpay, RAZORPAY_LAUNCH_PLANS, RazorpayLaunchPlanKey } from "@/lib/razorpay"
import { claimLaunchOfferSlot } from "@/lib/launch-offer"

// POST /api/razorpay/order — Create a Razorpay subscription
export async function POST(req: NextRequest) {
  try {
    if (!razorpay) {
      return NextResponse.json(
        { error: "Razorpay is not configured" },
        { status: 503 }
      )
    }

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
        { error: "User must belong to a company to subscribe" },
        { status: 400 }
      )
    }

    if (user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only company admins can manage billing" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { planKey, isLaunchOffer } = body as {
      planKey: RazorpayLaunchPlanKey
      isLaunchOffer?: boolean
    }

    if (!planKey || !(planKey in RAZORPAY_LAUNCH_PLANS)) {
      return NextResponse.json(
        { error: "Invalid plan key" },
        { status: 400 }
      )
    }

    const plan = RAZORPAY_LAUNCH_PLANS[planKey]

    if (!plan.razorpayPlanId) {
      return NextResponse.json(
        { error: "Razorpay plan ID not configured for this plan" },
        { status: 503 }
      )
    }

    // If launch offer, try to claim a slot
    if (isLaunchOffer) {
      const claimed = await claimLaunchOfferSlot()
      if (!claimed) {
        return NextResponse.json(
          { error: "Launch offer slots are full" },
          { status: 410 }
        )
      }
    }

    // Create Razorpay subscription with trial
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays)

    const subscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      total_count: 12, // 12 months annual
      start_at: Math.floor(trialEndsAt.getTime() / 1000), // Unix timestamp for trial end
    })

    // Update company with Razorpay info
    await prisma.company.update({
      where: { id: user.companyId },
      data: {
        razorpaySubscriptionId: subscription.id,
        paymentGateway: "razorpay",
        region: "IN",
        currency: "inr",
        isLaunchOffer: isLaunchOffer || false,
        trialEndsAt: isLaunchOffer ? trialEndsAt : null,
      },
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: plan.priceMonthly * 100, // Razorpay expects paise
      currency: plan.currency,
      planName: plan.name,
    })
  } catch (error) {
    console.error("POST /api/razorpay/order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
