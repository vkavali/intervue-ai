import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const protectedPaths = ["/practice", "/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  if (!token) {
    const signupUrl = new URL("/auth/signup", request.url);
    signupUrl.searchParams.set("role", "candidate");
    signupUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signupUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/practice/:path*", "/dashboard/:path*"],
};
