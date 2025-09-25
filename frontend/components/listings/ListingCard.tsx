"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ListingCardProps {
  listing: any;
  variant?: "card" | "compact"; // Add variant prop to distinguish between the two
}

export default function ListingCard({ listing, variant = "card" }: ListingCardProps) {
  const price = Number(listing.price || 0).toLocaleString();
  const photo = listing.main_photo || listing.photos?.[0]?.image || "/placeholder.jpg";

  // Common content that both variants share
  const commonContent = (
    <>
      <img
        src={photo}
        alt={listing.title}
        className="h-48 w-full object-cover"
      />
      <h3 className="text-lg font-semibold">{listing.title}</h3>
      <p className="text-sm text-gray-600 truncate">{listing.description}</p>
      <p className="text-base font-bold">₦{price}</p>
    </>
  );

  if (variant === "compact") {
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
              <div className="text-xs text-gray-500">
                {listing.bedrooms}bd • {listing.bathrooms}ba
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link href={`/properties/${listing.id}`}>
      <Card className="hover:shadow-lg transition rounded-2xl overflow-hidden">
        <CardContent className="p-4 space-y-2">
          {commonContent}
          <p className="text-xs text-gray-500">
            {listing.location?.city}, {listing.location?.state}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
