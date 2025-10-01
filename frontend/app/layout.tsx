
// frontend/app/layout.tsx
import "../styles/globals.css";
import { ReactNode } from "react";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import BrandHeader from "@/components/BrandHeader";
import { brands } from "@/lib/brandConfig";
import { headers } from "next/headers";
import type { Metadata } from "next";

/**
 * Domain-aware metadata generator
 * - Uses request host to pick brand
 */
export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get("host") || "";
  const brand = host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent;

  const url = `https://${brand.domain}`;

  return {
    title: brand.title,
    description: brand.description,
    themeColor: brand.themeColor,
    icons: {
      icon: brand.logo,
      // you can add shortcut, apple, etc.
      shortcut: brand.logo,
    },
    openGraph: {
      title: brand.title,
      description: brand.description,
      url,
      siteName: brand.name,
      images: [
        {
          url: brand.ogImage,
          width: 1200,
          height: 630,
          alt: `${brand.name} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: brand.title,
      description: brand.description,
      images: [brand.ogImage],
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  // Using headers() here is server-side and safe in layout
  const host = headers().get("host") || "";
  const brand = host.includes("checkalist.com") ? brands.checkalist : brands.fluxrent;
  const canonicalUrl = `https://${brand.domain}`;

  // JSON-LD: Organization for FluxRent, WebSite+SearchAction for Checkalist
  const jsonLd =
    brand === brands.checkalist
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
        };

  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS via CDN to avoid bundling errors */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        {/* favicon + theme-color */}
        <link rel="icon" href={brand.logo} />
        <meta name="theme-color" content={brand.themeColor} />
        {/* Structured data for crawlers */}
        <script
          type="application/ld+json"
          // JSON-LD is server-side here — safe to stringify
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>

      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <BrandHeader />
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
