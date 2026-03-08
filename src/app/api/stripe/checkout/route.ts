import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe, PLANS, PlanKey } from "@/lib/stripe"

// POST /api/stripe/checkout - Create a Stripe Checkout Session
export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
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
    const { priceId, planKey } = body as { priceId: string; planKey: PlanKey }

    if (!priceId || !planKey) {
      return NextResponse.json(
        { error: "Missing required fields: priceId, planKey" },
        { status: 400 }
      )
    }

    if (!(planKey in PLANS)) {
      return NextResponse.json(
        { error: "Invalid plan key" },
        { status: 400 }
      )
    }

    const plan = PLANS[planKey]
    if (!plan.priceId) {
      return NextResponse.json(
        { error: "This plan does not require a checkout session" },
        { status: 400 }
      )
    }

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000"

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: user.company.stripeCustomerId
        ? undefined
        : user.email,
      customer: user.company.stripeCustomerId || undefined,
      success_url: `${origin}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/billing?canceled=true`,
      metadata: {
        companyId: user.companyId,
        planKey,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("POST /api/stripe/checkout error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
