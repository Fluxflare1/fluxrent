// frontend/components/manager/InvoiceGenerator.tsx
"use client";
import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function InvoiceGenerator() {
  const [tenancyId, setTenancyId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function createInvoice(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { tenancy_id: tenancyId, due_date: dueDate, amount: amount || undefined };
      const res = await apiFetch("/api/rents/invoices/generate/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast({ title: "Invoice created", description: `Invoice ${res.uid} created.` });
      setTenancyId("");
      setDueDate("");
      setAmount("");
    } catch (err: any) {
      toast({ title: "Create failed", description: err?.payload?.detail || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border rounded p-4 bg-white shadow">
      <h3 className="font-semibold">Generate Invoice</h3>
      <form className="mt-3 space-y-3" onSubmit={createInvoice}>
        <div>
          <label className="text-sm block">Tenancy ID</label>
          <input className="w-full border p-2 rounded" value={tenancyId} onChange={(e) => setTenancyId(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm block">Due date</label>
          <input type="date" className="w-full border p-2 rounded" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm block">Amount (NGN) — optional (uses tenancy monthly rent if empty)</label>
          <input type="number" className="w-full border p-2 rounded" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit" disabled={loading}>
            Create Invoice
          </button>
        </div>
      </form>
    </section>
  );
}
