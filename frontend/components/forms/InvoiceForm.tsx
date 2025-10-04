// frontend/components/forms/InvoiceForm.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";

type BillItem = {
  id?: number;
  description: string;
  amount: string | number;
};

type Props = {
  initial?: {
    tenant_apartment?: number;
    type?: "rent" | "utility" | "other";
    due_date?: string;
    total_amount?: number | string;
    items?: BillItem[];
  };
  onSubmit: (payload: any) => Promise<void>;
  submitLabel?: string;
  tenantApartmentOptions?: { id: number; label: string }[]; // provided by parent
};

export default function InvoiceForm({ initial = {}, onSubmit, submitLabel = "Save Invoice", tenantApartmentOptions = [] }: Props) {
  const [tenantApartment, setTenantApartment] = useState<number | undefined>(initial.tenant_apartment);
  const [type, setType] = useState(initial.type || "rent");
  const [dueDate, setDueDate] = useState(initial.due_date || "");
  const [items, setItems] = useState<BillItem[]>(initial.items?.map(i => ({ ...i })) || []);
  const [totalAmount, setTotalAmount] = useState<number | string | undefined>(initial.total_amount);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    // ensure at least one item for UI convenience
    if (items.length === 0) {
      setItems([{ description: "Service Charge", amount: "0.00" }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computedTotal = useMemo(() => {
    const sum = items.reduce((acc, it) => {
      const amt = parseFloat(String(it.amount || 0)) || 0;
      return acc + amt;
    }, 0);
    return Number(sum.toFixed(2));
  }, [items]);

  useEffect(() => {
    // if user didn't explicitly provide total, keep synced with items
    if (totalAmount === undefined || totalAmount === null || totalAmount === "") {
      setTotalAmount(computedTotal);
    }
  }, [computedTotal]); // eslint-disable-line

  function updateItem(idx: number, patch: Partial<BillItem>) {
    setItems(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function addItem() {
    setItems(prev => [...prev, { description: "", amount: "0.00" }]);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors(null);

    if (!tenantApartment) {
      setErrors("Tenant / apartment is required.");
      setSubmitting(false);
      return;
    }
    if (!dueDate) {
      setErrors("Due date is required.");
      setSubmitting(false);
      return;
    }

    const payload = {
      tenant_apartment: tenantApartment,
      type,
      due_date: dueDate,
      total_amount: totalAmount,
      items: items.map(it => ({
        ...(it.id ? { id: it.id } : {}),
        description: it.description,
        amount: parseFloat(String(it.amount || 0)).toFixed(2),
      })),
    };

    try {
      await onSubmit(payload);
    } catch (err: any) {
      setErrors(err?.response?.data || err?.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
      {errors && <div className="text-sm text-red-600">{JSON.stringify(errors)}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Tenant / Apartment</label>
        <select
          value={tenantApartment ?? ""}
          onChange={e => setTenantApartment(Number(e.target.value))}
          className="mt-1 block w-full border rounded p-2"
          required
        >
          <option value="">Select tenant / apartment</option>
          {tenantApartmentOptions.map(opt => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select value={type} onChange={e => setType(e.target.value as any)} className="mt-1 block w-full border rounded p-2">
            <option value="rent">Rent</option>
            <option value="utility">Utility</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1 block w-full border rounded p-2" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Items</label>
        <div className="space-y-2 mt-2">
          {items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-6 border rounded p-2"
                placeholder="Description (e.g., Service Charge)"
                value={item.description}
                onChange={e => updateItem(idx, { description: e.target.value })}
              />
              <input
                className="col-span-3 border rounded p-2"
                placeholder="Amount"
                value={String(item.amount)}
                onChange={e => updateItem(idx, { amount: e.target.value })}
              />
              <div className="col-span-3 flex gap-2">
                <button type="button" onClick={() => removeItem(idx)} className="px-3 py-1 bg-red-500 text-white rounded">
                  Remove
                </button>
                {idx === items.length - 1 && (
                  <button type="button" onClick={addItem} className="px-3 py-1 bg-green-600 text-white rounded">
                    Add
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700">Total (auto)</label>
          <div className="mt-1 text-lg font-semibold">₦{computedTotal.toLocaleString()}</div>
        </div>

        <div className="text-right">
          <label className="block text-sm font-medium text-gray-700">Override Total (optional)</label>
          <input
            type="number"
            step="0.01"
            value={totalAmount ?? ""}
            onChange={e => setTotalAmount(e.target.value === "" ? undefined : parseFloat(e.target.value))}
            className="mt-1 border rounded p-2"
            placeholder={`${computedTotal}`}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded">
          {submitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
