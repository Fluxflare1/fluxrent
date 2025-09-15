// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const pathname = req.nextUrl.pathname;

  // allow public assets, api/auth and static routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/public") ||
    pathname.includes(".") // static file
  ) {
    return NextResponse.next();
  }

  // Unauthenticated: redirect to sign-in for protected routes
  const protectedPrefixes = ["/admin", "/property-admin", "/tenant", "/manager", "/dashboard"];
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!token && isProtected) {
    const url = new URL("/auth/signin", req.url);
    return NextResponse.redirect(url);
  }

  // If authenticated, enforce RBAC redirects for /dashboard (role-based landing)
  if (pathname === "/dashboard" && token) {
    const role = (token as any).role || "tenant";
    const target = role === "admin" ? "/admin/dashboard" : role === "property_admin" || role === "manager" ? "/manager/dashboard" : "/tenant/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  // If user tries to access area not permitted by role, redirect to unauthorized
  if (token) {
    const role = (token as any).role || "tenant";
    if (pathname.startsWith("/admin") && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/property-admin") && role !== "property_admin" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/manager") && role !== "manager" && role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/tenant") && role !== "tenant") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/property-admin/:path*", "/manager/:path*", "/tenant/:path*", "/dashboard"],
};
