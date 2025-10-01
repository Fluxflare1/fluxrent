// frontend/app/listings/properties/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import BoostButton from "@/components/listings/BoostButton";

export default function CheckalistListingDetail({ params }: { params: { id: string } }) {
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    async function fetchListing() {
      const res = await fetch(`/api/listings/${params.id}`);
      const data = await res.json();
      setListing(data);
    }
    fetchListing();
  }, [params.id]);

  if (!listing) return <p>Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold">{listing.title}</h1>
      <p className="text-slate-600">{listing.description}</p>

      <div className="mt-6">
        <BoostButton
          listingId={listing.id}
          onBoosted={() => {
            // Refetch or show toast
            console.log("Listing boosted");
          }}
        />
      </div>
    </div>
  );
}
