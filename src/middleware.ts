import { NextRequest, NextResponse } from "next/server"

// ──────────────────────────────────────────
// In-memory rate limiter (works on Railway persistent process)
// ──────────────────────────────────────────

const store = new Map<string, { count: number; resetAt: number }>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  auth:     { max: 30,  windowMs: 60_000 },   // 30 req/min for login, register
  reset:    { max: 10,  windowMs: 60_000 },   // 10 req/min for password reset (own bucket)
  ai:       { max: 40,  windowMs: 60_000 },   // 40 req/min for AI endpoints
  sessions: { max: 60,  windowMs: 60_000 },   // 60 req/min for sessions
  practice: { max: 60,  windowMs: 60_000 },   // 60 req/min for practice
  api:      { max: 120, windowMs: 60_000 },   // 120 req/min general
}

function rateLimit(ip: string, category: string): { ok: boolean; limit: number; remaining: number; resetAt: number } {
  const config = LIMITS[category] || LIMITS.api
  const key = `${ip}:${category}`
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { ok: true, limit: config.max, remaining: config.max - 1, resetAt: now + config.windowMs }
  }

  if (entry.count >= config.max) {
    return { ok: false, limit: config.max, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { ok: true, limit: config.max, remaining: config.max - entry.count, resetAt: entry.resetAt }
}

// Cleanup stale entries every 5 minutes
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 300_000) return
  lastCleanup = now
  for (const [key, entry] of Array.from(store.entries())) {
    if (now >= entry.resetAt) store.delete(key)
  }
}

// ──────────────────────────────────────────
// Route categorization
// ──────────────────────────────────────────

function getCategory(pathname: string): string {
  // Password reset gets its own bucket so forgot-password retries don't block the actual reset
  if (pathname.includes("/forgot-password") || pathname.includes("/reset-password")) return "reset"
  if (pathname.startsWith("/api/auth")) return "auth"
  if (
    pathname.includes("/ai") ||
    pathname.includes("/thinking") ||
    pathname.includes("/generate") ||
    pathname.includes("/enrich") ||
    pathname.includes("/coach") ||
    pathname.includes("/editorial") ||
    pathname.includes("/quality-score") ||
    pathname.includes("/weakness-profile") ||
    pathname.includes("/hints") ||
    pathname.includes("/parse") ||
    pathname.includes("/compare")
  ) return "ai"
  if (pathname.startsWith("/api/sessions")) return "sessions"
  if (pathname.startsWith("/api/practice")) return "practice"
  return "api"
}

function getClientIp(request: NextRequest): string {
  return (
    // Cloudflare sends the real client IP here
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1"
  )
}

// ──────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit all API routes
  if (pathname.startsWith("/api")) {
    cleanup()
    const ip = getClientIp(request)
    const category = getCategory(pathname)
    const { ok, limit, remaining, resetAt } = rateLimit(ip, category)

    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          },
        }
      )
    }

    const response = NextResponse.next()
    response.headers.set("X-RateLimit-Limit", String(limit))
    response.headers.set("X-RateLimit-Remaining", String(remaining))
    return response
  }

  // Auth check for /practice routes
  if (pathname.startsWith("/practice")) {
    const hasSession =
      request.cookies.has("next-auth.session-token") ||
      request.cookies.has("__Secure-next-auth.session-token")

    if (!hasSession) {
      const signupUrl = new URL("/auth/signup", request.url)
      signupUrl.searchParams.set("role", "candidate")
      signupUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signupUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/practice", "/practice/:path*"],
}
