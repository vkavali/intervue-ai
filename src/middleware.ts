import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Check for NextAuth session cookie (dev uses next-auth.*, prod uses __Secure-next-auth.*)
  const hasSession =
    request.cookies.has("next-auth.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  if (!hasSession) {
    const signupUrl = new URL("/auth/signup", request.url);
    signupUrl.searchParams.set("role", "candidate");
    signupUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(signupUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/practice", "/practice/:path*"],
};
