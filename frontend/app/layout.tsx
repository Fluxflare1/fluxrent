import "../styles/globals.css"
import { ReactNode } from "react"
import ProvidersWrapper from "@/components/ProvidersWrapper"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Copy node_modules/leaflet/dist/leaflet.css into: frontend/public/vendor/leaflet/leaflet.css */}
        <link rel="stylesheet" href="/vendor/leaflet/leaflet.css" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  )
}
