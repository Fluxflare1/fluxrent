// frontend/app/(dashboard)/bills/[id]/edit/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { fetchInvoice, updateInvoice } from "@/lib/bills";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";

export default function EditInvoicePage() {
  const router = useRouter();
  // Using Next.js 13 App Router param extraction
  const params = (typeof window !== "undefined" && (window.location.pathname.match(/\/bills\/(\d+)\/edit/) || [])) || [];
  const id = params[1];
  // Alternatively you might be using useParams from next/navigation if available in your version

  const [initial, setInitial] = useState<any>(null);
  const [tenantOptions, setTenantOptions] = useState<{ id: number; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const { data } = await fetchInvoice(Number(id));
        // normalize items to the form the component expects
        setInitial({
          tenant_apartment: data.tenant_apartment,
          type: data.type,
          due_date: data.due_date,
          total_amount: data.total_amount,
          items: (data.items || []).map((it: any) => ({ id: it.id, description: it.description, amount: it.amount })),
        });

        const { data: opts } = await api.get("/tenants/tenant-apartments/");
        setTenantOptions(opts || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  async function onSubmit(payload: any) {
    if (!id) throw new Error("Missing invoice id");
    await updateInvoice(Number(id), payload);
    router.push("/(dashboard)/bills");
  }

  if (!initial) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Edit Invoice</h1>
      <InvoiceForm initial={initial} tenantApartmentOptions={tenantOptions} onSubmit={onSubmit} submitLabel="Update Invoice" />
    </div>
  );
}
