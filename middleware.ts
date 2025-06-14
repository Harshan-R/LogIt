//middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const protectedPaths = ["/dashboard", "/upload", "/employees", "/projects"];
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // Read the Supabase auth cookie — replace with your actual project ref
  const token = request.cookies.get(
    "sb-fqwcuxdqectcthqgfphq-auth-token"
  )?.value;

  // If the route is protected and there's no token, redirect to login
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
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
