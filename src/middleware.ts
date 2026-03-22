import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// ──────────────────────────────────────────
// Redis rate limiters (initialized once at module load)
// ──────────────────────────────────────────

const redisUrl = process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

const hasRedis = !!(redisUrl && redisToken)

const redisClient = hasRedis ? new Redis({ url: redisUrl!, token: redisToken! }) : null

const limiters = redisClient
  ? {
      auth: new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        prefix: "rl:mw:auth",
      }),
      ai: new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(20, "1 m"),
        prefix: "rl:mw:ai",
      }),
      sessions: new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "rl:mw:sessions",
      }),
      practice: new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "rl:mw:practice",
      }),
      api: new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(60, "1 m"),
        prefix: "rl:mw:general",
      }),
    }
  : null

// ──────────────────────────────────────────
// In-memory fallback rate limiter
// ──────────────────────────────────────────

const memoryStore = new Map<string, { count: number; resetAt: number }>()

const MEMORY_LIMITS: Record<string, { max: number; windowMs: number }> = {
  auth: { max: 10, windowMs: 60_000 },
  ai: { max: 20, windowMs: 60_000 },
  sessions: { max: 30, windowMs: 60_000 },
  practice: { max: 30, windowMs: 60_000 },
  api: { max: 60, windowMs: 60_000 },
}

function memoryRateLimit(ip: string, category: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const config = MEMORY_LIMITS[category] || MEMORY_LIMITS.api
  const key = `${ip}:${category}`
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now >= entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return { success: true, limit: config.max, remaining: config.max - 1, reset: now + config.windowMs }
  }

  if (entry.count >= config.max) {
    return { success: false, limit: config.max, remaining: 0, reset: entry.resetAt }
  }

  entry.count++
  return { success: true, limit: config.max, remaining: config.max - entry.count, reset: entry.resetAt }
}

// Cleanup stale entries every 5 minutes
let lastMemoryCleanup = Date.now()
function cleanupMemory() {
  const now = Date.now()
  if (now - lastMemoryCleanup < 300_000) return
  lastMemoryCleanup = now
  for (const [key, entry] of Array.from(memoryStore.entries())) {
    if (now >= entry.resetAt) memoryStore.delete(key)
  }
}

// ──────────────────────────────────────────
// Route categorization
// ──────────────────────────────────────────

function getRouteCategory(pathname: string): string {
  if (pathname.startsWith("/api/auth")) return "auth"
  if (pathname.includes("/ai") || pathname.includes("/thinking") || pathname.includes("/generate") || pathname.includes("/enrich") || pathname.includes("/coach") || pathname.includes("/editorial") || pathname.includes("/quality-score") || pathname.includes("/weakness-profile") || pathname.includes("/hints") || pathname.includes("/parse") || pathname.includes("/compare")) return "ai"
  if (pathname.startsWith("/api/sessions") || pathname.startsWith("/api/practice")) return "sessions"
  return "api"
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

// ──────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rate limit all API routes
  if (pathname.startsWith("/api")) {
    const ip = getClientIp(request)
    const category = getRouteCategory(pathname)

    let success: boolean
    let limit: number
    let remaining: number
    let reset: number

    if (limiters) {
      const limiter = limiters[category as keyof typeof limiters] || limiters.api
      const result = await limiter.limit(ip)
      success = result.success
      limit = result.limit
      remaining = result.remaining
      reset = result.reset
    } else {
      cleanupMemory()
      const result = memoryRateLimit(ip, category)
      success = result.success
      limit = result.limit
      remaining = result.remaining
      reset = result.reset
    }

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
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
