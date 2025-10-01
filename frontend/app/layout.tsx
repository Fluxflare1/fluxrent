import "../styles/globals.css"
import { ReactNode } from "react"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/components/AuthProvider"
import BrandHeader from "@/components/BrandHeader"
import { brands } from "@/lib/brandConfig"
import { cookies, headers } from "next/headers"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"

function detectBrand() {
  const cookieStore = cookies()
  const brandCookie = cookieStore.get("brand")?.value

  if (brandCookie && brands[brandCookie as "fluxrent" | "checkalist"]) {
    return brands[brandCookie as "fluxrent" | "checkalist"]
  }

  const host = headers().get("host") || ""
  return host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent
}

/**
 * Domain-aware metadata generator
 */
export async function generateMetadata(): Promise<Metadata> {
  const brand = detectBrand()
  const url = `https://${brand.domain}`

  return {
    title: brand.title,
    description: brand.description,
    themeColor: brand.themeColor,
    icons: { icon: brand.logo, shortcut: brand.logo },
    openGraph: {
      title: brand.title,
      description: brand.description,
      url,
      siteName: brand.name,
      images: [{ url: brand.ogImage, width: 1200, height: 630, alt: `${brand.name} preview` }],
    },
    twitter: {
      card: "summary_large_image",
      title: brand.title,
      description: brand.description,
      images: [brand.ogImage],
    },
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const brand = detectBrand()
  const canonicalUrl = `https://${brand.domain}`

  // JSON-LD varies by brand
  const jsonLd =
    brand.name === "Checkalist"
      ? {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: brand.name,
          url: canonicalUrl,
          description: brand.description,
          potentialAction: {
            "@type": "SearchAction",
            target: `${canonicalUrl}/listings?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }
      : {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: brand.name,
          url: canonicalUrl,
          logo: brand.logo,
          description: brand.description,
          contactPoint: [
            {
              "@type": "ContactPoint",
              email: brand.contact?.email || "",
              contactType: "customer support",
            },
          ],
        }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href={brand.logo} />
        <meta name="theme-color" content={brand.themeColor} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Providers>
          <AuthProvider>
            <BrandHeader />
            <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
            <Footer />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
}
