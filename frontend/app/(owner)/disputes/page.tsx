import React from "react";
import DisputeAdminClient from "./DisputeAdminClient";

export const metadata = {
  title: "Admin — Disputes",
  description: "Dispute triage dashboard",
};

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-4">Dispute Triage</h1>
      <DisputeAdminClient />
    </div>
  );
}
