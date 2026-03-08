import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// POST /api/sessions/:id/violations - Log a session violation
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = params.id
    const body = await req.json()
    const { type, timestamp } = body

    // Log to console (in production, could store in DB)
    console.log(
      `[VIOLATION] Session: ${sessionId}, User: ${session.user.email}, Type: ${type}, Time: ${timestamp}`
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Violation log error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
