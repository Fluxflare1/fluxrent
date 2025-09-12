import "./styles/globals.css";
import React from "react";

export const metadata = {
  title: "Tenant Management SaaS",
  description: "Tenant & Property Management SaaS MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
