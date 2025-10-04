import React from "react";
import dynamic from "next/dynamic";

export const metadata = {
  title: "Admin — Disputes",
  description: "Dispute triage dashboard",
};

// Create a client wrapper component for the dynamic import
const DisputeAdminClient = dynamic(
  () => import("@/components/admin/DisputeAdmin"),
  { 
    ssr: false,
    loading: () => <p>Loading disputes...</p>
  }
);

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Dispute Triage</h1>
      <DisputeAdminClient />
    </div>
  );
}
