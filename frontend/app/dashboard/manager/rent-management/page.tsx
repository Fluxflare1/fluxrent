// frontend/app/dashboard/manager/rent-management/page.tsx
import React from "react";
import { apiFetch } from "@/lib/api";
import CollectionSummary from "@/components/manager/CollectionSummary";
import InvoiceGenerator from "@/components/manager/InvoiceGenerator";

export const metadata = {
  title: "Rent Management - Manager",
};

async function getSummary() {
  try {
    return await apiFetch("/api/rents/reports/collection-summary/");
  } catch (e) {
    return null;
  }
}

export default async function ManagerRentManagementPage() {
  const data = await getSummary();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Rent Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <CollectionSummary data={data} />
          <InvoiceGenerator />
        </div>

        <div className="space-y-4">
          <section className="border rounded p-4 bg-white shadow">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <button
                className="btn btn-primary w-full"
                onClick={() => {
                  // client side call to preview late fees (UI can be expanded)
                  window.open("/manager/preview-late-fees", "_blank");
                }}
              >
                Preview Late Fees
              </button>
              <a className="block mt-2 text-sm text-slate-600">Use the "Invoice generator" to create invoices in bulk or single.</a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
