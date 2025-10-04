"use client";
import { useParams } from "next/navigation";
import PaymentForm from "@/components/payments/PaymentForm";

export default function PayInvoicePage() {
  const params = useParams();
  const invoiceId = Number(params.id);

  return (
    <div className="p-6">
      <PaymentForm invoiceId={invoiceId} />
    </div>
  );
}
