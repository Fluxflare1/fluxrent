// frontend/app/dashboard/tenant/rents/receipt/[id]/page.tsx
import React from "react";
import { apiFetch } from "@/lib/";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

async function fetchReceiptPdf(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"}/api/rents/payments/${id}/receipt_pdf/`, {
    headers: {
      Accept: "application/pdf",
      // Authorization handled client-side if needed
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch receipt");
  }
  const blob = await res.arrayBuffer();
  return blob;
}

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const id = params.id;
  let data: ArrayBuffer | null = null;
  try {
    data = await fetchReceiptPdf(id);
  } catch (e) {
    return <div className="p-6">Failed to load receipt.</div>;
  }

  // Convert to base64 for inline embedding
  const base64 = Buffer.from(data).toString("base64");
  const src = `data:application/pdf;base64,${base64}`;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold">Receipt</h1>
      <div className="mt-4">
        <iframe src={src} width="100%" height="800px" title="Receipt PDF" />
      </div>
      <div className="mt-4">
        <a href={src} download={`receipt-${id}.pdf`} className="btn btn-primary">
          Download PDF
        </a>
      </div>
    </div>
  );
}
