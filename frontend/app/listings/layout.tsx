// app/listings/layout.tsx
import "../../styles/globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Checkalist - Property Listings Hub",
  description:
    "Discover rental properties, apartments, and homes on Checkalist. Search, filter, and compare listings with ease.",
  openGraph: {
    title: "Checkalist",
    description: "Your hub for property listings and rentals.",
    url: "https://checkalist.com",
    siteName: "Checkalist",
    images: [
      {
        url: "https://checkalist.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Checkalist Listings",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/checkalist-favicon.ico",
  },
};

export default function ListingsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data (Property Listings Website) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Checkalist",
              url: "https://checkalist.com",
              description:
                "Browse and search property listings, rentals, and apartments.",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://checkalist.com/properties?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
