import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Simple in-memory signaling store (per-session, per-recipient)
// In production, use Redis or WebSocket
const signalStore = new Map<string, Array<{ type: string; sdp?: unknown; candidate?: unknown; from: string; timestamp: number }>>()

// Cleanup old signals periodically (older than 30s)
function cleanupSignals() {
  const now = Date.now()
  const entries = Array.from(signalStore.entries())
  for (const [key, signals] of entries) {
    const filtered = signals.filter((s) => now - s.timestamp < 30000)
    if (filtered.length === 0) {
      signalStore.delete(key)
    } else {
      signalStore.set(key, filtered)
    }
  }
}

// GET /api/sessions/[id]/signal?for=userId - Poll for signaling messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const forUserId = searchParams.get("for")
    if (!forUserId) {
      return NextResponse.json([], { status: 200 })
    }

    const key = `${params.id}:${forUserId}`
    const signals = signalStore.get(key) || []

    // Clear after reading
    signalStore.delete(key)

    cleanupSignals()

    return NextResponse.json(signals)
  } catch (error) {
    console.error("GET signal error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// POST /api/sessions/[id]/signal - Send a signaling message
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { type, sdp, candidate, from } = body

    if (!type || !from) {
      return NextResponse.json({ error: "type and from are required" }, { status: 400 })
    }

    // Store for all other participants (broadcast to everyone except sender)
    // In a simple 1:1 call, the "other" person will poll and get this
    // We store under sessionId:* and filter by sender when reading
    // Simple approach: store for the session, each poller gets messages not from themselves
    const sessionId = params.id

    // Get all participants by checking who has polled recently
    // Simple approach: store signal for a generic "other" key
    // The recipient will be whoever is NOT the sender
    const signal = { type, sdp, candidate, from, timestamp: Date.now() }

    // Store for all potential recipients (excluding sender)
    // For simplicity, store with a wildcard key pattern
    // Recipients poll with their own userId and get signals not from themselves
    const existingKeys = Array.from(signalStore.keys()).filter((k) => k.startsWith(`${sessionId}:`))

    if (existingKeys.length === 0) {
      // No one is polling yet, store under a generic key
      const genericKey = `${sessionId}:__broadcast__`
      const existing = signalStore.get(genericKey) || []
      existing.push(signal)
      signalStore.set(genericKey, existing)
    }

    // Also store for any specific known recipients
    for (const key of existingKeys) {
      const recipientId = key.split(":")[1]
      if (recipientId !== from && recipientId !== "__broadcast__") {
        const existing = signalStore.get(key) || []
        existing.push(signal)
        signalStore.set(key, existing)
      }
    }

    // Ensure a key exists for the sender too (so we know they're a participant)
    const senderKey = `${sessionId}:${from}`
    if (!signalStore.has(senderKey)) {
      signalStore.set(senderKey, [])
    }

    // Move broadcast signals to specific recipients
    const broadcastKey = `${sessionId}:__broadcast__`
    const broadcastSignals = signalStore.get(broadcastKey) || []
    if (broadcastSignals.length > 0) {
      for (const key of Array.from(signalStore.keys())) {
        if (key.startsWith(`${sessionId}:`) && key !== broadcastKey) {
          const recipientId = key.split(":")[1]
          const recipientSignals = signalStore.get(key) || []
          for (const bs of broadcastSignals) {
            if (bs.from !== recipientId) {
              recipientSignals.push(bs)
            }
          }
          signalStore.set(key, recipientSignals)
        }
      }
      signalStore.delete(broadcastKey)
    }

    cleanupSignals()

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("POST signal error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
