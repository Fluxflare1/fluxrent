// frontend/components/wallet/FundWallet.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import WalletActionWrapper from "./WalletActionWrapper";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

type Props = {
  email: string;
  walletId: number | string;
};

export default function FundWallet({ email, walletId }: Props) {
  const [amount, setAmount] = useState<number | null>(null);
  const { toast } = useToast();

  function openPaystack(amountNaira: number) {
    if (!window.PaystackPop) {
      toast({ title: "Paystack not loaded", description: "Paystack script is missing. Add it to your _document or layout." });
      return;
    }
    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY!,
      email,
      amount: Math.round(amountNaira * 100), // kobo
      currency: "NGN",
      callback: async function (response: any) {
        // After getting payment reference, we require validation via modal.
        const reference = response.reference;
        try {
          // Open validation modal via WalletActionWrapper by calling its open callback (we use wrapper below)
          // But since the wrapper triggers modal, we instead call backend validate inside wrapper and then confirm
          // We will use WalletActionWrapper below to perform final confirm.
          toast({ title: "Payment succeeded", description: "Please authenticate to complete funding." });
          // We'll store reference in localStorage temporarily (could use context)
          localStorage.setItem("pending_fund_reference", reference);
          // now ask the wrapper to validate & finalize (we do this by user clicking 'Complete funding' button shown below)
        } catch (err) {
          toast({ title: "Funding error", description: "Could not process funding confirmation." });
        }
      },
      onClose: function () {
        toast({ title: "Payment window closed" });
      },
    });
    handler.openIframe();
  }

  async function confirmFund(validationResp?: any) {
    // get stored reference
    const reference = localStorage.getItem("pending_fund_reference");
    if (!reference) throw new Error("No pending reference");
    const payload = { wallet_id: walletId, reference };
    const res = await apiFetch(ENDPOINTS.wallet.fundConfirm, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    // cleanup
    localStorage.removeItem("pending_fund_reference");
    return res;
  }

  return (
    <div className="border rounded-xl p-4 shadow space-y-3">
      <h3 className="font-semibold">Fund wallet</h3>
      <input
        type="number"
        min={100}
        placeholder="Amount (NGN)"
        className="w-full border p-2 rounded"
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <div className="flex gap-2">
        <Button
          onClick={() => {
            if (!amount || amount < 100) {
              toast({ title: "Invalid amount", description: "Enter an amount >= 100" });
              return;
            }
            openPaystack(amount);
          }}
        >
          Pay with Card / Bank
        </Button>

        <WalletActionWrapper
          actionName="Confirm Funding"
          methodOptions={["pin", "password"]}
          onValidated={async () => {
            try {
              await confirmFund();
              toast({ title: "Funding confirmed", description: "Your wallet has been credited." });
            } catch (err: any) {
              toast({ title: "Confirm failed", description: err?.payload?.detail || err.message || "Error" });
            }
          }}
        >
          {(open) => (
            <Button onClick={open} variant="ghost">
              Complete funding (Authenticate)
            </Button>
          )}
        </WalletActionWrapper>
      </div>
    </div>
  );
}
