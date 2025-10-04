"use client";
import { useEffect, useState } from "react";
import { fetchInvoices } from "@/lib/bills";
import InvoiceTable from "@/components/bills/InvoiceTable";
import Link from "next/link";

export default function BillsPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await fetchInvoices();
      setInvoices(data);
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      <Link href="/property-manager/bills/create" className="btn-primary mb-4 inline-block">Create Invoice</Link>
      <InvoiceTable invoices={invoices} />
    </div>
  );
}
