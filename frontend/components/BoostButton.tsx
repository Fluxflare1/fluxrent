"use client";
import { useState } from "react";
import { api, ENDPOINTS } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export default function BoostButton({ propertyId }: { propertyId: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleWalletBoost = async () => {
    try {
      setLoading(true);
      await api.post(ENDPOINTS.properties.boost(propertyId));
      toast({ title: "Boost activated from wallet!" });
    } catch (err) {
      toast({ title: "Not enough balance, use Paystack", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackBoost = async () => {
    try {
      setLoading(true);
      const res = await api.post("/api/properties/boosts/initiate/", {
        property_id: propertyId,
      });

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
        email: res.data.email,
        amount: res.data.amount * 100,
        metadata: res.data.metadata,
        callback: (response: any) => {
          toast({ title: "Boost payment processing, refreshing soon!" });
        },
        onClose: () => toast({ title: "Payment cancelled" }),
      });
      handler.openIframe();
    } catch (err) {
      toast({ title: "Error launching Paystack", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-x-2">
      <button
        onClick={handleWalletBoost}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Boost (Wallet)
      </button>
      <button
        onClick={handlePaystackBoost}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Boost (Paystack)
      </button>
    </div>
  );
}
