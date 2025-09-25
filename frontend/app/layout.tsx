// frontend/app/layout.tsx
import "../styles/globals.css";
import { ReactNode } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { AuthProvider } from "@/components/AuthProvider";


export const metadata = {
  title: "FluxRent",
  description: "Tenant, Property management platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}




// frontend/app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
