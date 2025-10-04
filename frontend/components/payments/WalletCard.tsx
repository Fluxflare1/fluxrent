"use client";
import { useEffect, useState } from "react";
import { getWallet, topUpWallet } from "@/services/payment.service";

export default function WalletCard() {
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);

  const loadWallet = async () => {
    const { data } = await getWallet();
    setWallet(data);
  };

  const handleTopUp = async () => {
    if (amount > 0) {
      await topUpWallet(amount, "card");
      alert("Redirecting to payment gateway...");
      // Redirect to Paystack/Flutterwave iframe etc.
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  if (!wallet) return <p>Loading wallet...</p>;

  return (
    <div className="bg-white shadow-md p-4 rounded-xl">
      <h2 className="text-lg font-bold">Wallet</h2>
      <p className="mt-2">Balance: ₦{wallet.balance}</p>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="input mt-3 w-full"
      />
      <button
        onClick={handleTopUp}
        className="btn-primary mt-3 w-full"
      >
        Top Up
      </button>
    </div>
  );
}
