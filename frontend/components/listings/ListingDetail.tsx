"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ListingDetailProps {
  listing: any;
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  return (
    <div className="space-y-6">
      <img
        src={listing.main_photo || "/placeholder.jpg"}
        alt={listing.title}
        className="w-full h-96 object-cover rounded-2xl"
      />

      <Card className="p-6">
        <CardContent className="space-y-4">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-gray-700">{listing.description}</p>

          <p className="text-lg font-bold">
            ₦{listing.price.toLocaleString()}{" "}
            <span className="text-sm font-normal">per year</span>
          </p>

          <ul className="text-gray-600 space-y-1">
            <li>Bedrooms: {listing.bedrooms}</li>
            <li>Bathrooms: {listing.bathrooms}</li>
            <li>Toilets: {listing.toilets}</li>
            <li>Service Charge: ₦{listing.service_charge?.toLocaleString()}</li>
          </ul>

          <p className="text-sm text-gray-500">
            Location: {listing.location?.address},{" "}
            {listing.location?.city}, {listing.location?.state}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
