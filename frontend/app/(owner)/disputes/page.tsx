// frontend/app/(owner)/disputes/page.tsx
import React from "react";
import dynamic from "next/dynamic";

export const metadata = {
  title: "Admin — Disputes",
  description: "Dispute triage dashboard",
};

// load client component dynamically to keep page a server component wrapper
const DisputeAdmin = dynamic(() => import("~/components/admin/DisputeAdmin"), { ssr: false });

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Dispute Triage</h1>
      <DisputeAdmin />
    </div>
  );
}
