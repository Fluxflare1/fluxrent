

"use client";

import { useEffect, useState } from "react";
import WalletBalances from "@/components/wallet/WalletBalances";
import FundWallet from "@/components/wallet/FundWallet";
import TransferForm from "@/components/wallet/TransferForm";
import StandingOrders from "@/components/wallet/StandingOrders";
import Bills from "@/components/wallet/Bills";
import FixedSavings from "@/components/wallet/FixedSavings";
import { authApi, ENDPOINTS } from "@/lib/api";

export default function WalletPage() {
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    authApi
      .get(ENDPOINTS.wallet.base)
      .then((res) => setWallets(res.data))
      .catch((err) => console.error("Failed to load wallets", err));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>

      <WalletBalances wallets={wallets} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FundWallet />
        <TransferForm />
      </div>

      <StandingOrders />
      <Bills />
      <FixedSavings />
    </div>
  );
}
