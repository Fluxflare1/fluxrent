// frontend/components/listings/BoostButton.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authApi, ENDPOINTS, apiFetch } from "@/lib/api";

type Props = {
  listingId: string;
  userId?: string;
  onBoosted?: () => void;
};

export default function BoostButton({ listingId, onBoosted }: Props) {
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authApi.get(ENDPOINTS.boost.packages);
        if (mounted) setPackages(res.data || res);
      } catch (err) {
        console.error(err);
        toast({ title: "Failed", description: "Could not load boost packages" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function purchaseViaWallet(pkgId: number) {
    setLoading(true);
    try {
      const payload = { listing_id: listingId, package_id: pkgId, method: "wallet" };
      const res = await authApi.post(ENDPOINTS.boost.purchase, payload);
      toast({ title: "Boost active", description: "Listing has been boosted." });
      onBoosted?.();
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.message || "Error";
      toast({ title: "Boost failed", description: msg });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 border rounded-md bg-white">
      <h4 className="font-semibold mb-2">Boost listing</h4>
      <div className="space-y-2">
        {packages.map((p) => (
          <div key={p.id} className="flex items-center justify-between border rounded p-2">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.duration_days} days — ₦{Number(p.price).toLocaleString()}</div>
            </div>
            <div>
              <Button disabled={loading} onClick={() => purchaseViaWallet(p.id)}>
                Pay with Wallet
              </Button>
            </div>
          </div>
        ))}
        {!packages.length && <div className="text-sm text-gray-500">No boost packages available</div>}
      </div>
    </div>
  );
}
