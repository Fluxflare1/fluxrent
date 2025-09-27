"use client";

import { useEffect, useState } from "react";
import WalletBalances from "@/components/wallet/WalletBalances";
import FundWallet from "@/components/wallet/FundWallet";
import TransferForm from "@/components/wallet/TransferForm";
import StandingOrders from "@/components/wallet/StandingOrders";
import Bills from "@/components/wallet/Bills";
import FixedSavings from "@/components/wallet/FixedSavings";
import { ENDPOINTS } from "@/lib/api";

export default function WalletPage() {
  const [wallets, setWallets] = useState([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);

    if (t) {
      fetch(ENDPOINTS.wallet.balances, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((res) => res.json())
        .then(setWallets);
    }
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">My Wallet</h1>

      <WalletBalances wallets={wallets} />

      {token && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FundWallet email="user@example.com" amount={5000} />
          <TransferForm token={token} />
        </div>
      )}

      {token && (
        <>
          <StandingOrders token={token} />
          <Bills token={token} />
          <FixedSavings token={token} />
        </>
      )}
    </div>
  );
}







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
