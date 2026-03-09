import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
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
