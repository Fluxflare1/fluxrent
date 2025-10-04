// frontend/app/(dashboard)/bills/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { fetchInvoices, deleteInvoice } from "@/lib/bills";
import Link from "next/link";
import api from "@/lib/api";

export default function BillsIndexPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchInvoices();
        setInvoices(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      alert("Could not delete invoice");
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <Link href="/(dashboard)/bills/create" className="px-4 py-2 bg-green-600 text-white rounded">
          Create Invoice
        </Link>
      </div>

      <div className="space-y-3">
        {invoices.length === 0 && <div>No invoices found.</div>}
        {invoices.map(inv => (
          <div key={inv.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">UID: {inv.uid}</div>
              <div className="font-medium">{inv.type.toUpperCase()} — ₦{Number(inv.total_amount).toLocaleString()}</div>
              <div className="text-sm text-gray-600">Due: {inv.due_date} • Paid: {inv.is_paid ? "Yes" : "No"}</div>
            </div>
            <div className="flex gap-2">
              <Link href={`/(dashboard)/bills/${inv.id}/edit`} className="px-3 py-1 bg-blue-600 text-white rounded">Edit</Link>
              <button onClick={() => handleDelete(inv.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
