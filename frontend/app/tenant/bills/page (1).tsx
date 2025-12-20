"use client";
import { useEffect, useState } from "react";
import { fetchInvoices } from "@/lib/bills";
import InvoiceTable from "@/components/bills/InvoiceTable";

export default function TenantBillsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await fetchInvoices();
      setInvoices(data);
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Bills</h1>
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
