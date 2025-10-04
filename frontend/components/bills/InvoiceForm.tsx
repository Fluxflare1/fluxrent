"use client";
import { useState } from "react";
import { createInvoice } from "@/lib/bills";
import { useRouter } from "next/navigation";

export default function InvoiceForm() {
  const [form, setForm] = useState({ tenant_apartment: "", type: "rent", total_amount: "", due_date: "" });
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    await createInvoice(form);
    router.push("/property-manager/bills");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input placeholder="Tenant Apartment ID" value={form.tenant_apartment}
             onChange={(e)=>setForm({...form, tenant_apartment:e.target.value})}
             className="input" />
      <select value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})} className="input">
        <option value="rent">Rent</option>
        <option value="utility">Utility</option>
        <option value="other">Other</option>
      </select>
      <input type="number" placeholder="Total Amount" value={form.total_amount}
             onChange={(e)=>setForm({...form, total_amount:e.target.value})}
             className="input" />
      <input type="date" value={form.due_date}
             onChange={(e)=>setForm({...form, due_date:e.target.value})}
             className="input" />
      <button type="submit" className="btn-primary">Create Invoice</button>
    </form>
  );
}
