import "./styles/globals.css";
import React from "react";
import { AuthProvider } from "@/context/AuthContext"; // Import the AuthProvider

export const metadata = {
  title: "Tenant Management SaaS",
  description: "Tenant & Property Management SaaS MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Keep your global styles and classes */}
      <body className="bg-gray-50 text-gray-900">
        {/* Wrap children with the AuthProvider */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
