// frontend/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";

  // Determine brand by hostname
  let brand = "fluxrent";
  if (host.includes("checkalist.com")) {
    brand = "checkalist";
  }

  // Set brand in cookies (readable by server & client)
  const res = NextResponse.next();
  res.cookies.set("brand", brand, { path: "/" });
  return res;
}
