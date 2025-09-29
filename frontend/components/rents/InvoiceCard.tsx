// frontend/components/rents/InvoiceCard.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import PayModal from "./PayModal";
import { useToast } from "@/hooks/use-toast";

export default function InvoiceCard({ invoice }: { invoice: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{invoice.uid}</h3>
          <div className="text-sm text-slate-600">{invoice.description}</div>
          <div className="mt-2 text-sm">
            Due: <strong>{invoice.due_date}</strong>
          </div>
          <div className="mt-1 text-lg">
            Amount: <strong>₦{invoice.amount}</strong>
          </div>
          <div className="text-sm text-slate-500">Outstanding: ₦{invoice.outstanding}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`px-3 py-1 rounded ${invoice.status === "paid" ? "bg-green-100 text-green-800" : invoice.status === "overdue" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
            {invoice.status}
          </div>
          <Button onClick={() => setOpen(true)} disabled={invoice.status === "paid"}>
            Pay
          </Button>
        </div>
      </div>

      <PayModal invoice={invoice} open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
