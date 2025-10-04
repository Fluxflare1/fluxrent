"use client";
import { useState } from "react";
import { payWithWallet, confirmCashPayment } from "@/services/payment.service";
import { useRouter } from "next/navigation";

export default function PaymentForm({ invoiceId }: { invoiceId: number }) {
  const [method, setMethod] = useState("wallet");
  const [reference, setReference] = useState("");
  const router = useRouter();

  const handlePay = async () => {
    if (method === "wallet") {
      await payWithWallet(invoiceId);
      alert("Paid with wallet successfully!");
    } else if (method === "cash") {
      await confirmCashPayment(invoiceId, reference);
      alert("Cash payment submitted for confirmation!");
    } else if (method === "card") {
      alert("Redirecting to Paystack...");
      // Redirect to external gateway
    }
    router.push("/(dashboard)/payments");
  };

  return (
    <div className="bg-white shadow-lg p-6 rounded-xl">
      <h2 className="text-lg font-bold mb-4">Pay Invoice</h2>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="input w-full"
      >
        <option value="wallet">Wallet</option>
        <option value="card">Card (Paystack)</option>
        <option value="cash">Cash/Bank Transfer</option>
      </select>
      {method === "cash" && (
        <input
          placeholder="Reference ID"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="input mt-3 w-full"
        />
      )}
      <button onClick={handlePay} className="btn-primary mt-4 w-full">
        Pay Now
      </button>
    </div>
  );
}
