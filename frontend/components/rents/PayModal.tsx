// frontend/components/rents/PayModal.tsx
"use client";
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PayModal({ invoice, open, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function payWithWallet() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/rents/payments/pay_with_wallet/", {
        method: "POST",
        body: JSON.stringify({ invoice_id: invoice.id }),
      });
      toast({ title: "Payment successful", description: "Your wallet was debited and receipt generated." });
      onClose();
      // optionally refresh page
    } catch (err: any) {
      toast({ title: "Payment failed", description: err?.payload?.detail || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => (val ? null : onClose())}>
      <div className="p-4">
        <h3 className="text-lg font-semibold">Pay Invoice {invoice.uid}</h3>
        <div className="mt-2">Amount: ₦{invoice.outstanding}</div>
        <div className="mt-4 flex gap-2">
          <Button onClick={payWithWallet} disabled={loading}>
            Pay with Wallet
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              // fallback: go to external fund flow (Paystack)
              toast({ title: "Use Fund wallet screen to top up and pay." });
            }}
          >
            Fund Wallet & Pay
          </Button>
          <Button variant="link" onClick={() => onClose()}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
