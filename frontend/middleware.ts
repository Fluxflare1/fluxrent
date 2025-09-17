import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  const role = req.cookies.get("user_role")?.value;

  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!token || role !== "super_admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Apply middleware only to admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
