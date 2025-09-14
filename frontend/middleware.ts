import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      if (!token) return false;

      const role = (token as any).role;

      if (pathname.startsWith("/dashboard/admin")) {
        return role === "admin";
      }
      if (pathname.startsWith("/dashboard/manager")) {
        return role === "property_manager" || role === "admin";
      }
      if (pathname.startsWith("/dashboard/tenant")) {
        return role === "tenant";
      }
      if (pathname.startsWith("/dashboard/agent")) {
        return role === "agent";
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};





// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/property-admin") ||
      pathname.startsWith("/tenant")
    ) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }
    return NextResponse.next();
  }

  // RBAC
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/property-admin") && token.role !== "property_admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/tenant") && token.role !== "tenant") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/property-admin/:path*", "/tenant/:path*"],
};
