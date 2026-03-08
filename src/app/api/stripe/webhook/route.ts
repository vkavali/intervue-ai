import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { stripe, getPlanByPriceId } from "@/lib/stripe"
import Stripe from "stripe"

// Map PlanKey from our PLANS object to the database plan field values
const planKeyToDbPlan: Record<string, string> = {
  FREE: "STARTER",
  PRO: "GROWTH",
  ENTERPRISE: "ENTERPRISE",
}

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      )
    }

    const body = await req.text()
    const signature = req.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured")
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      )
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      console.error("Webhook signature verification failed:", message)
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${message}` },
        { status: 400 }
      )
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const checkoutSession = event.data.object as Stripe.Checkout.Session

        const companyId = checkoutSession.metadata?.companyId
        const planKey = checkoutSession.metadata?.planKey

        if (!companyId || !planKey) {
          console.error("Missing metadata in checkout session:", checkoutSession.id)
          break
        }

        const dbPlan = planKeyToDbPlan[planKey] || planKey
        const customerId =
          typeof checkoutSession.customer === "string"
            ? checkoutSession.customer
            : checkoutSession.customer?.id

        await prisma.company.update({
          where: { id: companyId },
          data: {
            plan: dbPlan,
            stripeCustomerId: customerId || undefined,
          },
        })

        console.log(
          `Company ${companyId} upgraded to ${dbPlan} (Stripe customer: ${customerId})`
        )
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id

        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (!company) {
          console.error("No company found for Stripe customer:", customerId)
          break
        }

        // Get the price ID from the first subscription item
        const priceId = subscription.items.data[0]?.price?.id
        if (priceId) {
          const planKey = getPlanByPriceId(priceId)
          if (planKey) {
            const dbPlan = planKeyToDbPlan[planKey] || planKey
            await prisma.company.update({
              where: { id: company.id },
              data: { plan: dbPlan },
            })
            console.log(`Company ${company.id} subscription updated to ${dbPlan}`)
          }
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription

        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id

        const company = await prisma.company.findFirst({
          where: { stripeCustomerId: customerId },
        })

        if (!company) {
          console.error("No company found for Stripe customer:", customerId)
          break
        }

        // Downgrade to free/starter plan when subscription is cancelled
        await prisma.company.update({
          where: { id: company.id },
          data: { plan: "STARTER" },
        })

        console.log(
          `Company ${company.id} subscription cancelled, downgraded to STARTER`
        )
        break
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("POST /api/stripe/webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
