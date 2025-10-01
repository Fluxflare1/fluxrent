// frontend/components/BrandHeader.tsx
"use client";

import React from "react";
import { brands } from "@/lib/brandConfig";

/**
 * Small client header that chooses the brand by window.host.
 * This keeps your header visual distinct per domain without changing server code.
 */
export default function BrandHeader() {
  // client-only host detection
  const host = typeof window !== "undefined" ? window.location.host : "";
  const brand = host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent;

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={brand.logo} alt={brand.name} className="h-8" />
          <div>
            <div className="font-semibold text-lg" style={{ color: brand.themeColor }}>
              {brand.name}
            </div>
            <div className="text-xs text-slate-500 hidden sm:block">{brand.description}</div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <a href="/" className="hover:underline">
            Home
          </a>
          <a href={host.includes("checkalist.com") ? "/listings" : "/properties"} className="hover:underline">
            {host.includes("checkalist.com") ? "Listings" : "Platform"}
          </a>
          <a href="/dashboard" className="hover:underline">
            Dashboard
          </a>
        </nav>
      </div>
    </header>
  );
}
