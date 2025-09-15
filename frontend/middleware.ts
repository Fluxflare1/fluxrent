// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET || "";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public assets and auth pages are allowed
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.startsWith("/auth") || pathname.startsWith("/static") || pathname.includes(".svg") || pathname.includes(".png") ) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/property-admin") ||
    pathname.startsWith("/tenant") ||
    pathname.startsWith("/agent")
  ) {
    const token = await getToken({ req, secret: SECRET }) as any | null;
    if (!token) {
      // not signed in
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    // RBAC checks
    if (pathname.startsWith("/admin") && token.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/property-admin") && token.role !== "property_admin") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/tenant") && token.role !== "tenant") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    if (pathname.startsWith("/agent") && token.role !== "agent") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/property-admin/:path*", "/tenant/:path*", "/agent/:path*"],
};
