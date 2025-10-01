// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simple host-based rewrite:
 * - checkalist.com  => /listings
 * - fluxrent.com    => /properties
 *
 * Keep API, _next, static and public paths alone.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const url = req.nextUrl.clone();

  // don't rewrite API, _next, static assets
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/static") ||
    url.pathname.startsWith("/fonts") ||
    url.pathname.startsWith("/assets")
  ) {
    return NextResponse.next();
  }

  // Only rewrite the root path. Allow deep links to pass through.
  if (url.pathname === "/") {
    if (host.includes("checkalist.com")) {
      url.pathname = "/listings"; // listings entrypoint
      return NextResponse.rewrite(url);
    }

    // default / fluxrent
    url.pathname = "/properties";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
