import { brands } from "@/lib/brandConfig"
import { cookies, headers } from "next/headers"
import ProvidersWrapperClient from "@/components/ProvidersWrapperClient"

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
  const brand = detectBrand()
  return <ProvidersWrapperClient brand={brand}>{children}</ProvidersWrapperClient>
}
