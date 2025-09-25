"use client";

import Link from "next/link";

// Individual listing card component
interface ListingCardProps {
  listing: any;
}

function ListingCard({ listing }: ListingCardProps) {
  const price = Number(listing.price || 0).toLocaleString();
  const photo = listing.photos?.[0]?.image || "/placeholder.jpg";
  
  return (
    <Link href={`/properties/${listing.id}`} className="block">
      <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden">
        <div className="h-48 w-full bg-gray-100">
          <img src={photo} alt={listing.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold leading-tight">{listing.title}</h3>
          <p className="text-sm text-gray-600 truncate mt-1">{listing.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-700 font-bold">₦{price}</div>
            <div className="text-xs text-gray-500">{listing.bedrooms}bd • {listing.bathrooms}ba</div>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Grid container component
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
