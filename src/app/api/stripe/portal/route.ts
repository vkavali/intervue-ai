import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

// POST /api/stripe/portal - Create a Stripe Billing Portal session
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
        { error: "User must belong to a company" },
        { status: 400 }
      )
    }

    if (user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Only company admins can manage billing" },
        { status: 403 }
      )
    }

    if (!user.company.stripeCustomerId) {
      return NextResponse.json(
        { error: "No active subscription found. Please subscribe to a plan first." },
        { status: 400 }
      )
    }

    const origin = req.headers.get("origin") || process.env.NEXTAUTH_URL || "http://localhost:3000"

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.company.stripeCustomerId,
      return_url: `${origin}/dashboard/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("POST /api/stripe/portal error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
