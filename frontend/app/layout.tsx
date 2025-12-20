import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"

import "../styles/globals.css"
import { ReactNode } from "react"
import ProvidersWrapper from "@/components/ProvidersWrapper"

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ProvidersWrapper>{children}</ProvidersWrapper>
      </body>
    </html>
  )
}
