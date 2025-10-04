"use client";

import { useEffect } from "react";
import { useRentStore } from "@/store/rent.store";

export default function InvoiceList() {
  const { invoices, fetchInvoices, loading } = useRentStore();

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  if (loading) return <p>Loading invoices...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Invoices</h2>
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
