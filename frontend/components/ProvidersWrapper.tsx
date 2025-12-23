import { brands } from "@/lib/brandConfig"
import ProvidersWrapperClient from "@/components/ProvidersWrapperClient"
import { cookies, headers } from "next/headers"

type BrandKey = "fluxrent" | "checkalist"

async function detectBrand() {
  const cookieStore = await cookies()
  const brandCookie = cookieStore.get("brand")?.value as BrandKey | undefined

  if (brandCookie && brands[brandCookie]) {
    return brands[brandCookie]
  }

  const headersList = await headers()
  const host = headersList.get("host") || ""

  return host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent
}

export default async function ProvidersWrapper({
  children,
}: {
  children?: React.ReactNode
}) {
  const brand = await detectBrand()
  return <ProvidersWrapperClient brand={brand}>{children}</ProvidersWrapperClient>
}
