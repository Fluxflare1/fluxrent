"use client"

import React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "@/components/ui/toast"
import { AuthProvider } from "@/components/AuthProvider"
import BrandHeader from "@/components/BrandHeader"
import Footer from "@/components/Footer"
import { brands } from "@/lib/brandConfig"
import { cookies, headers } from "next/headers"

function detectBrand() {
  const cookieStore = cookies()
  const brandCookie = cookieStore.get("brand")?.value

  if (brandCookie && brands[brandCookie as "fluxrent" | "checkalist"]) {
    return brands[brandCookie as "fluxrent" | "checkalist"]
  }

  const host = headers().get("host") || ""
  return host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent
}

export default function ProvidersWrapper({ children }: { children?: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
        },
      })
  )

  const brand = detectBrand()

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrandHeader brand={brand} />
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <Footer brand={brand} />
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  )
}
