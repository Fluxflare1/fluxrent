// frontend/components/manager/CollectionSummary.tsx
"use client";
import React from "react";

export default function CollectionSummary({ data }: any) {
  if (!data) {
    return <div className="p-4 border rounded bg-white">Failed to load report.</div>;
  }

  const totals = data.totals || {};
  return (
    <section className="border rounded p-4 bg-white shadow">
      <h2 className="text-lg font-semibold">Collection Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="p-3 border rounded">
          <div className="text-sm text-slate-500">Collected</div>
          <div className="text-xl font-bold">₦{totals.collected ?? "0.00"}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-sm text-slate-500">Outstanding</div>
          <div className="text-xl font-bold">₦{totals.outstanding ?? "0.00"}</div>
        </div>
        <div className="p-3 border rounded">
          <div className="text-sm text-slate-500">Invoices</div>
          <div className="text-xl font-bold">{totals.invoices_count ?? 0}</div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-medium">Top Properties (sample)</h3>
        <ul className="mt-2 space-y-2">
          {(data.per_property || []).slice(0, 10).map((p: any) => (
            <li key={p.property_uid} className="flex justify-between">
              <div>{p.property_uid}</div>
              <div>Collected: ₦{p.collected} / Out: ₦{p.outstanding}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
