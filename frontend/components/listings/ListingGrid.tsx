"use client";

import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: any[];
}

export default function ListingGrid({ listings }: ListingGridProps) {
  if (!listings?.length) {
    return <p className="text-center text-gray-500">No properties found</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
