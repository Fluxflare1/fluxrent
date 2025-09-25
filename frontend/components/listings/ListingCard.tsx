"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ListingCardProps {
  listing: any;
}

export default function ListingCard({ listing }: ListingCardProps) {
  return (
    <Link href={`/properties/${listing.id}`}>
      <Card className="hover:shadow-lg transition rounded-2xl overflow-hidden">
        <img
          src={listing.main_photo || "/placeholder.jpg"}
          alt={listing.title}
          className="h-48 w-full object-cover"
        />
        <CardContent className="p-4 space-y-2">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-sm text-gray-600 truncate">
            {listing.description}
          </p>
          <p className="text-base font-bold">
            ₦{listing.price.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            {listing.location?.city}, {listing.location?.state}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
