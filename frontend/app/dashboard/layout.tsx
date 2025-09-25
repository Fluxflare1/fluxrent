// frontend/app/dashboard/layout.tsx
"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, fetchUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!loading && !isAuthenticated) {
        router.replace("/auth/login");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* a simple nav — extend with role-based links */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-lg font-semibold">FluxRent Dashboard</div>
          <div> {/* user menu placeholder */} </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">{children}</main>
    </div>
  );
}
