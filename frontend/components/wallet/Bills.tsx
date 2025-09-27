// frontend/components/wallet/Bills.tsx
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import WalletActionWrapper from "./WalletActionWrapper";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Bills({ }: { }) {
  const [bills, setBills] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(ENDPOINTS.wallet.bills);
        setBills(res);
      } catch (err: any) {
        console.error(err);
      }
    })();
  }, []);

  async function payWithWallet(billId: number) {
    await apiFetch(`${ENDPOINTS.wallet.bills}${billId}/pay/`, {
      method: "POST",
      body: JSON.stringify({ method: "wallet" }),
    });
  }

  function openPaystackForBill(bill: any) {
    if (!window.PaystackPop) {
      toast({ title: "Paystack missing" });
      return;
    }
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
      email: bill.tenant_email || "",
      amount: Math.round(Number(bill.amount) * 100),
      callback(response: any) {
        localStorage.setItem("pending_bill_reference", JSON.stringify({ reference: response.reference, billId: bill.id }));
        toast({ title: "Payment successful", description: "Authenticate to complete" });
      },
      onClose() {
        toast({ title: "Payment closed" });
      },
    });
    handler.openIframe();
  }

  async function confirmBillPaymentAfterValidation() {
    const raw = localStorage.getItem("pending_bill_reference");
    if (!raw) throw new Error("No pending bill payment");
    const { reference, billId } = JSON.parse(raw);
    const res = await apiFetch(`${ENDPOINTS.wallet.bills}${billId}/pay/confirm/`, {
      method: "POST",
      body: JSON.stringify({ reference }),
    });
    localStorage.removeItem("pending_bill_reference");
    return res;
  }

  return (
    <div className="border rounded-xl p-4 shadow space-y-3">
      <h3 className="font-semibold">Bills</h3>
      <ul className="space-y-2">
        {bills.map((b) => (
          <li key={b.id} className="flex items-center justify-between border rounded p-2">
            <div>
              <div className="font-medium">{b.description || b.type}</div>
              <div className="text-sm text-slate-600">Due: {b.due_date}</div>
            </div>
            <div className="flex gap-2">
              <WalletActionWrapper
                actionName="Authorize wallet payment"
                methodOptions={["pin"]}
                onValidated={async () => {
                  try {
                    await payWithWallet(b.id);
                    toast({ title: "Paid", description: "Bill paid with wallet" });
                    // refresh list
                    const res = await apiFetch(ENDPOINTS.wallet.bills);
                    setBills(res);
                  } catch (err: any) {
                    toast({ title: "Error", description: err?.payload?.detail || err.message });
                  }
                }}
              >
                {(open) => <Button onClick={open}>Pay with Wallet</Button>}
              </WalletActionWrapper>

              <Button onClick={() => openPaystackForBill(b)}>Pay (Card/Bank)</Button>
            </div>
          </li>
        ))}
      </ul>

      {/* button to complete any pending paystack payments */}
      <WalletActionWrapper
        actionName="Confirm external payment"
        methodOptions={["pin", "password"]}
        onValidated={async () => {
          try {
            await confirmBillPaymentAfterValidation();
            toast({ title: "Bill payment confirmed" });
            const res = await apiFetch(ENDPOINTS.wallet.bills);
            setBills(res);
          } catch (err: any) {
            toast({ title: "Confirm failed", description: err?.payload?.detail || err.message });
          }
        }}
      >
        {(open) => <Button onClick={open} variant="outline">Complete external payments</Button>}
      </WalletActionWrapper>
    </div>
  );
}
