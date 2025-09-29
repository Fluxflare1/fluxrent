// frontend/app/dashboard/tenant/rents/page.tsx
import React from "react";
import { cookies } from "next/headers";
import { fetchListingServer } from "@/lib/api"; // not used here but keep consistent
import { apiFetch } from "@/lib/api";
import InvoiceCard from "@/components/rents/InvoiceCard";

export const metadata = {
  title: "My Rents",
};

async function getInvoices() {
  // server-side fetch; returns invoices for current user (backend uses request.user)
  return await apiFetch("/api/rents/invoices/?page_size=50", { method: "GET" });
}

export default async function RentsPage() {
  let invoices = [];
  try {
    const data = await getInvoices();
    invoices = data.results || data;
  } catch (e) {
    invoices = [];
  }
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">My Rent Invoices</h1>
      <div className="grid grid-cols-1 gap-4">
        {invoices.length === 0 ? (
          <div>You have no invoices.</div>
        ) : (
          invoices.map((inv: any) => <InvoiceCard key={inv.id} invoice={inv} />)
        )}
      </div>
    </div>
  );
}
