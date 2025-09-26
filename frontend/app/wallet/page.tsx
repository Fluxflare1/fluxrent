"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ENDPOINTS } from "@/lib/api";
import { useSession } from "next-auth/react";
import WalletTransactionList from "@/components/wallet/WalletTransactionList";
import StandingOrders from "@/components/wallet/StandingOrders";
import Bills from "@/components/wallet/Bills";
import FixedSavings from "@/components/wallet/FixedSavings";
import WalletSecurityModal from "@/components/wallet/WalletSecurityModal";

export default function WalletDashboard() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [wallet, setWallet] = useState<any>(null);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(ENDPOINTS.wallet.me, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setWallet(data));
  }, [token]);

  const handleSecureAction = (action: string) => {
    setPendingAction(action);
    setShowSecurityModal(true);
  };

  return (
    <div className="p-6">
      {wallet && (
        <Card className="mb-6">
          <CardContent>
            <h2 className="text-xl font-bold">{wallet.user_name}</h2>
            <p className="text-sm text-gray-500">Wallet No: {wallet.number}</p>
            <h1 className="text-3xl font-semibold mt-4">₦{wallet.balance}</h1>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => handleSecureAction("fund")}>Fund Wallet</Button>
              <Button onClick={() => handleSecureAction("transfer")}>Transfer</Button>
              <Button onClick={() => handleSecureAction("withdraw")}>Withdraw</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="standing">Standing Orders</TabsTrigger>
          <TabsTrigger value="bills">Bills</TabsTrigger>
          <TabsTrigger value="savings">Fixed Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <WalletTransactionList token={token} />
        </TabsContent>
        <TabsContent value="standing">
          <StandingOrders token={token} />
        </TabsContent>
        <TabsContent value="bills">
          <Bills token={token} />
        </TabsContent>
        <TabsContent value="savings">
          <FixedSavings token={token} />
        </TabsContent>
      </Tabs>

      <WalletSecurityModal
        open={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        action={pendingAction}
        token={token}
      />
    </div>
  );
}
