// frontend/components/wallet/WithdrawRequest.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import WalletActionWrapper from "./WalletActionWrapper";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function WithdrawRequest({}: {}) {
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const { toast } = useToast();

  async function submitWithdrawal() {
    if (!walletId || !amount || amount <= 0 || !bankAccount || !bankName || !accountName) {
      toast({ title: "Invalid input", description: "Fill all fields" });
      return;
    }
    const payload = {
      wallet_id: walletId,
      amount,
      bank_account: bankAccount,
      bank_name: bankName,
      account_name: accountName,
    };
    const res = await apiFetch(ENDPOINTS.wallet.withdrawals, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    toast({ title: "Withdrawal requested", description: "Admin will review the request." });
    return res;
  }

  return (
    <div className="border rounded-xl p-4 shadow space-y-3">
      <h3 className="font-semibold">Request Withdrawal</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input placeholder="Wallet ID" value={walletId} onChange={(e) => setWalletId(e.target.value)} />
        <Input placeholder="Amount" type="number" onChange={(e) => setAmount(Number(e.target.value))} />
        <Input placeholder="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
        <Input placeholder="Bank account number" value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} />
        <Input placeholder="Account name (as on bank)" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
      </div>

      <WalletActionWrapper
        actionName="Request withdrawal"
        methodOptions={["pin", "password"]}
        onValidated={async () => {
          try {
            await submitWithdrawal();
          } catch (err: any) {
            toast({ title: "Error", description: err?.payload?.detail || err.message });
          }
        }}
      >
        {(open) => <Button onClick={open}>Submit Withdrawal Request</Button>}
      </WalletActionWrapper>
    </div>
  );
}
