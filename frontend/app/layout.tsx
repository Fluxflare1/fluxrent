import "./styles/globals.css";
import React from "react";
import { ToastProvider } from "@/components/ui/toast";

export const metadata = {
  title: "Tenant Management",
  description: "Tenant & Property Management SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
