"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiFetch, ENDPOINTS } from "@/lib/api";

type Props = {
  listingId: number | string;
};

export default function BoostListing({ listingId }: Props) {
  const { toast } = useToast();
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  async function boost() {
    try {
      setLoading(true);
      const res = await apiFetch(ENDPOINTS.listings.boost(listingId), {
        method: "POST",
        body: JSON.stringify({ days }),
      });
      toast({ title: "Listing boosted", description: `Boost valid until ${res.boost_until}` });
    } catch (err: any) {
      toast({ title: "Error", description: err?.payload?.detail || err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 border rounded space-y-2">
      <h4 className="font-medium">Boost your property</h4>
      <input
        type="number"
        value={days}
        min={7}
        onChange={(e) => setDays(Number(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <Button onClick={boost} disabled={loading}>
        {loading ? "Processing..." : `Boost for ${days} days`}
      </Button>
    </div>
  );
}
