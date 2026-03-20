import { NextResponse } from "next/server"
import { getLaunchOfferStatus } from "@/lib/launch-offer"

// GET /api/launch-offer/status — Public endpoint
export async function GET() {
  try {
    const status = await getLaunchOfferStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error("GET /api/launch-offer/status error:", error)
    return NextResponse.json(
      { claimed: 0, remaining: 100, isActive: true },
      { status: 200 }
    )
  }
}
