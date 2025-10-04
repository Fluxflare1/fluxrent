"use client";

import { useEffect, useState } from "react";
import { useRentStore } from "@/store/rent.store";
import InvoiceForm from "./InvoiceForm";

export default function InvoiceList() {
  const { invoices, fetchInvoices, loading } = useRentStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold">Invoices</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-3 py-1 bg-green-600 text-white rounded"
        >
          + Generate
        </button>
      </div>

      {showForm && (
        <InvoiceForm tenancyId={1} onSuccess={() => {
          fetchInvoices();
          setShowForm(false);
        }} />
      )}

      <ul className="divide-y">
        {invoices.map((inv) => (
          <li key={inv.id} className="p-2 flex justify-between">
            <div>
              <p>{inv.description ?? inv.uid}</p>
              <p className="text-sm text-gray-500">
                Due: {inv.due_date} — Status: {inv.status}
              </p>
            </div>
            <span className="font-medium">{inv.outstanding}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
