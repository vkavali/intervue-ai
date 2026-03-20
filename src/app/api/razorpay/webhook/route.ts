import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// POST /api/razorpay/webhook — Handle Razorpay webhook events
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 503 }
      )
    }

    const body = await req.text()
    const signature = req.headers.get("x-razorpay-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    const event = JSON.parse(body)
    const eventType = event.event as string

    switch (eventType) {
      case "subscription.activated": {
        console.log("Razorpay subscription activated:", event.payload?.subscription?.entity?.id)
        break
      }

      case "subscription.charged": {
        console.log("Razorpay subscription charged:", event.payload?.subscription?.entity?.id)
        break
      }

      case "subscription.cancelled":
      case "subscription.halted": {
        const subscriptionId = event.payload?.subscription?.entity?.id as string | undefined
        if (subscriptionId) {
          await prisma.company.updateMany({
            where: { razorpaySubscriptionId: subscriptionId },
            data: { plan: "STARTER" },
          })
          console.log("Razorpay subscription cancelled/halted, downgraded:", subscriptionId)
        }
        break
      }

      default:
        console.log("Unhandled Razorpay webhook event:", eventType)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("POST /api/razorpay/webhook error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
