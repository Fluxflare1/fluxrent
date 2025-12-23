
import { ReactNode } from "react"
import ProvidersWrapper from "@/components/ProvidersWrapper"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Load globals via static file to avoid PostCSS parsing issues */}
        <link rel="stylesheet" href="/globals.css" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  )
}
