import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkIpRateLimit } from "@/lib/rate-limiter";

// Max request body size (1MB for general, 5MB for code execution)
const MAX_BODY_SIZE = 1 * 1024 * 1024;
const MAX_CODE_BODY_SIZE = 5 * 1024 * 1024;

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets, _next, and public files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);

  // === IP Rate Limiting ===
  if (pathname.startsWith("/api/")) {
    // Determine rate limit category
    let action: "general" | "auth" | "ai" = "general";

    if (
      pathname.startsWith("/api/auth/") ||
      pathname === "/api/auth/register"
    ) {
      action = "auth";
    } else if (
      pathname.includes("/ai") ||
      pathname.includes("/generate") ||
      pathname.includes("/practice-ai") ||
      pathname.includes("/audit") ||
      pathname.includes("/thinking")
    ) {
      action = "ai";
    }

    const ipCheck = checkIpRateLimit(ip, action);
    if (!ipCheck.allowed) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: ipCheck.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipCheck.retryAfter),
            "X-RateLimit-Limit": String(ipCheck.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // === Request Size Protection ===
    const contentLength = req.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      const maxSize = pathname.startsWith("/api/execute")
        ? MAX_CODE_BODY_SIZE
        : MAX_BODY_SIZE;
      if (size > maxSize) {
        return NextResponse.json(
          { error: "Request body too large." },
          { status: 413 }
        );
      }
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(ipCheck.limit));
    response.headers.set("X-RateLimit-Remaining", String(ipCheck.remaining));

    // === Single-Device Session Check ===
    // For authenticated API routes, validate the session token matches the active token
    if (
      !pathname.startsWith("/api/auth/") &&
      pathname.startsWith("/api/")
    ) {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      if (token?.activeSessionToken && token?.currentSessionToken) {
        if (token.activeSessionToken !== token.currentSessionToken) {
          return NextResponse.json(
            {
              error: "Session expired. You have been logged in on another device.",
              code: "SESSION_CONFLICT",
            },
            { status: 401 }
          );
        }
      }
    }

    return response;
  }

  // === Protect dashboard routes ===
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Single-device check for page routes too
    if (token.activeSessionToken && token.currentSessionToken) {
      if (token.activeSessionToken !== token.currentSessionToken) {
        const signInUrl = new URL("/auth/signin", req.url);
        signInUrl.searchParams.set("error", "session_conflict");
        return NextResponse.redirect(signInUrl);
      }
    }
  }

  // === Protect session routes ===
  if (pathname.startsWith("/session/")) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/session/:path*",
  ],
};
