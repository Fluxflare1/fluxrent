"use client";
import React from "react";
import Providers from "@/app/providers/Providers";
import { AuthProvider } from "@/components/AuthProvider";
import BrandHeader from "@/components/BrandHeader";
import Footer from "@/components/Footer";

export default function ProvidersWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <Providers>
      <AuthProvider>
        <BrandHeader />
        <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
        <Footer />
      </AuthProvider>
    </Providers>
  );
}
