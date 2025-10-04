"use client";

import { useState } from "react";
import { RentService } from "@/services/rent.service";

interface Props {
  invoiceId: number;
  onSuccess: () => void;
}

export default function PaymentForm({ invoiceId, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("wallet");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      if (method === "wallet") {
        await RentService.payWithWallet({ invoice: String(invoiceId), amount });
      } else {
        await RentService.recordExternalPayment({
          invoice_id: invoiceId,
          amount,
          method,
          reference,
        });
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded shadow">
      <h3 className="font-semibold">Pay Invoice</h3>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="wallet">Wallet</option>
        <option value="bank">Bank</option>
        <option value="cash">Cash</option>
        <option value="external">External</option>
      </select>
      {method !== "wallet" && (
        <input
          type="text"
          placeholder="Reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full border p-2 rounded"
        />
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Processing..." : "Submit Payment"}
      </button>
    </div>
  );
}
