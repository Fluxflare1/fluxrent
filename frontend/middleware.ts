// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const pathname = req.nextUrl.pathname;

  // Public routes that should be reachable without auth
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signout",
    "/api/public", // add more as needed
  ];
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next();

  // If no token and trying to access protected areas -> redirect to signin
  if (!token) {
    // protect these namespaces
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/property-admin") ||
      pathname.startsWith("/tenant") ||
      pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // RBAC: restrict per path
  const role = (token as any).role || "tenant";

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/property-admin") && role !== "property_admin" && role !== "manager") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/tenant") && role !== "tenant") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/property-admin/:path*",
    "/tenant/:path*",
    "/dashboard/:path*",
  ],
};
