"use client";
import { useState } from "react";
import { createBillItem } from "@/lib/bills";

export default function BillItemForm({ invoiceId }: { invoiceId: string }) {
  const [form, setForm] = useState({ description: "", amount: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await createBillItem({ ...form, invoice: invoiceId });
    setForm({ description: "", amount: "" });
    window.location.reload();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input placeholder="Description" value={form.description}
             onChange={(e)=>setForm({...form, description:e.target.value})}
             className="input flex-1" />
      <input type="number" placeholder="Amount" value={form.amount}
             onChange={(e)=>setForm({...form, amount:e.target.value})}
             className="input w-32" />
      <button type="submit" className="btn-primary">Add</button>
    </form>
  );
}
