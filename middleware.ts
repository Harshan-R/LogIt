// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPaths = ["/dashboard", "/upload", "/employees", "/projects"];
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
  const token = request.cookies.get("sb-access-token")?.value;

  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/employees/:path*",
    "/projects/:path*",
  ],
};
