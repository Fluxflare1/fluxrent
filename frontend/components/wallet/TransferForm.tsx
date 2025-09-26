"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ENDPOINTS } from "@/lib/api";

export default function TransferForm({ token }: { token: string }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const handleTransfer = async () => {
    const res = await fetch(ENDPOINTS.wallet.transfer, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipient, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Transfer successful");
    } else {
      alert(data.error || "Transfer failed");
    }
  };

  return (
    <div className="space-y-3">
      <Input placeholder="Recipient Wallet No" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
      <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Button onClick={handleTransfer}>Transfer</Button>
    </div>
  );
}
