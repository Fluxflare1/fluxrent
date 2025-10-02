// frontend/components/ProvidersWrapper.tsx
"use client"

import React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ToastContainer } from "@/components/ui/toast"
import { AuthProvider } from "@/components/AuthProvider"
import BrandHeader from "@/components/BrandHeader"
import Footer from "@/components/Footer"

export default function ProvidersWrapper({ children }: { children?: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 1000 * 60 * 5, retry: 1, refetchOnWindowFocus: false },
        },
      })
  )

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrandHeader />
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <Footer />
          <ToastContainer />
        </AuthProvider>
      </QueryClientProvider>
    </NextThemesProvider>
  )
}
