"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ListingCardProps {
  listing: any;
  variant?: "card" | "compact";
}

export default function ListingCard({ listing, variant = "card" }: ListingCardProps) {
  // Aligned data extraction with backend
  const price = Number(listing.price || 0);
  const currency = listing.currency || "NGN";
  const formattedPrice = price.toLocaleString();
  
  // Get cover image - aligned with backend PropertyMedia model
  const coverMedia = listing.media?.find((media: any) => media.is_cover) || listing.media?.[0];
  const coverImage = coverMedia?.file || "/placeholder.jpg";
  
  // Use short_description from backend, fallback to description
  const description = listing.short_description || listing.description;

  // Format currency display
  const formatCurrency = (amount: number, curr: string) => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€"
    };
    return `${symbols[curr] || curr} ${formattedPrice}`;
  };

  // Boost badge for featured listings
  const BoostBadge = () => 
    listing.is_boosted ? (
      <Badge variant="secondary" className="absolute top-2 left-2 bg-yellow-500 text-white">
        Featured
      </Badge>
    ) : null;

  if (variant === "compact") {
    return (
      <Link href={`/listings/${listing.id}`} className="block">
        <article className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition overflow-hidden relative">
          <div className="h-48 w-full bg-gray-100 relative">
            <img 
              src={coverImage} 
              alt={listing.title} 
              className="w-full h-full object-cover" 
            />
            <BoostBadge />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold leading-tight line-clamp-1">{listing.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm font-bold">
                {formatCurrency(price, currency)}
              </div>
              <div className="text-xs text-gray-500">
                {listing.bedrooms || 0}bd • {listing.bathrooms || 0}ba
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="hover:shadow-lg transition rounded-2xl overflow-hidden relative h-full">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="h-48 w-full bg-gray-100 relative flex-shrink-0">
            <img
              src={coverImage}
              alt={listing.title}
              className="h-48 w-full object-cover"
            />
            <BoostBadge />
          </div>
          <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-semibold line-clamp-1">{listing.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1 flex-grow">
              {description}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-base font-bold">
                {formatCurrency(price, currency)}
              </p>
              <p className="text-xs text-gray-500">
                {listing.bedrooms || 0}bd • {listing.bathrooms || 0}ba
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
