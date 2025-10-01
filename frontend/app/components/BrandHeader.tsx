// app/components/BrandHeader.tsx
"use client"

import { headers } from "next/headers"
import { brands } from "@/lib/brandConfig"

export default function BrandHeader() {
  const host = typeof window !== "undefined" ? window.location.host : ""
  const brand =
    host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent

  return (
    <header className="p-4 flex items-center justify-between">
      <img src={brand.logo} alt={brand.name} className="h-8" />
      <span
        className="font-semibold"
        style={{ color: brand.themeColor }}
      >
        {brand.name}
      </span>
    </header>
  )
}
