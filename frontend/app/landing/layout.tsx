// app/landing/layout.tsx
import "../../styles/globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "FluxRent - Property & Rent Management Platform",
  description:
    "FluxRent helps landlords and tenants with property management, rent collection, tenancy tracking, property listings, and payments.",
  openGraph: {
    title: "FluxRent",
    description: "All-in-one property & rent management platform.",
    url: "https://fluxrent.com",
    siteName: "FluxRent",
    images: [
      {
        url: "https://fluxrent.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "FluxRent Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/fluxrent-favicon.ico",
  },
};

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data (Business/Organization) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FluxRent",
              url: "https://fluxrent.com",
              logo: "https://fluxrent.com/logo.png",
              description:
                "FluxRent is a platform for property management, rent collection, and tenant services.",
              sameAs: [
                "https://twitter.com/fluxrent",
                "https://linkedin.com/company/fluxrent",
              ],
            }),
          }}
        />
      </head>
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
