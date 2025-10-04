"use client";
import { useEffect, useState } from "react";
import { fetchInvoice } from "@/lib/bills";
import { useParams } from "next/navigation";
import InvoiceDetail from "@/components/bills/InvoiceDetail";

export default function TenantInvoiceDetailPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await fetchInvoice(params.invoiceId as string);
      setInvoice(data);
    })();
  }, [params.invoiceId]);

  if (!invoice) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <InvoiceDetail invoice={invoice} />
      {!invoice.is_paid && (
        <button className="btn-primary mt-4">Pay Now</button> // ⚡ integrates with payments module later
      )}
    </div>
  );
}
