// frontend/app/(dashboard)/bills/create/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import InvoiceForm from "@/components/forms/InvoiceForm";
import { createInvoice } from "@/lib/api/bills";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [tenantOptions, setTenantOptions] = useState<{ id: number; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Fetch tenant-apartment options from API. Endpoint may vary — adjust as needed.
        const { data } = await api.get("/tenants/tenant-apartments/"); // must exist on backend or provide appropriate route
        // Expect list of { id, label }
        setTenantOptions(data || []);
      } catch (err) {
        console.error("Could not load tenant/apartment options", err);
      }
    })();
  }, []);

  async function onSubmit(payload: any) {
    await createInvoice(payload);
    router.push("/(dashboard)/bills");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Invoice</h1>
      <InvoiceForm tenantApartmentOptions={tenantOptions} onSubmit={onSubmit} />
    </div>
  );
}
