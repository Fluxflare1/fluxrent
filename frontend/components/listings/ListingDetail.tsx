"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ListingDetailProps {
  listing: any;
}

export default function ListingDetail({ listing }: ListingDetailProps) {
  const [activeImage, setActiveImage] = useState(listing.media?.[0]?.file || "/placeholder.jpg");

  // Safe data extraction aligned with backend
  const price = Number(listing.price || listing.base_price || 0);
  const currency = listing.currency || "NGN";
  const formattedPrice = price.toLocaleString();
  const serviceCharge = listing.service_charge || 0;
  
  // Format currency display
  const formatCurrency = (amount: number, curr: string) => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€"
    };
    return `${symbols[curr] || curr} ${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
          <img
            src={activeImage}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Thumbnail Gallery */}
        {listing.media && listing.media.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {listing.media.map((media: any) => (
              <button
                key={media.id}
                onClick={() => setActiveImage(media.file)}
                className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden ${
                  activeImage === media.file ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={media.file}
                  alt={media.caption || listing.title}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{listing.title}</h1>
                  <p className="text-gray-600 mt-1">{listing.short_description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {listing.address || `${listing.location?.city}, ${listing.location?.state}`}
                  </p>
                </div>
                {listing.is_boosted && (
                  <Badge variant="secondary" className="bg-yellow-500 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed">{listing.description}</p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Property Details</h4>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>Bedrooms: {listing.bedrooms || 0}</li>
                    <li>Bathrooms: {listing.bathrooms || 0}</li>
                    <li>Toilets: {listing.toilets || 0}</li>
                    <li>Service Charge: {formatCurrency(serviceCharge, currency)}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <ul className="text-gray-600 space-y-1 text-sm">
                    <li>Owner: {listing.owner_name || "Not specified"}</li>
                    <li>Agent: {listing.agent_name || "Not assigned"}</li>
                  </ul>
                </div>
              </div>

              {/* Facilities */}
              {listing.facilities && listing.facilities.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-2">Facilities</h4>
                  <div className="flex flex-wrap gap-2">
                    {listing.facilities.map((facility: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(price, currency)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {listing.listing_type === 'RENT' ? 'per year' : 'one-time payment'}
                </p>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Book Inspection
              </Button>

              {/* Engagement Metrics */}
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-2">Listing Performance</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Ranking Score:</span>
                    <span className="font-medium">{listing.ranking_score || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Views:</span>
                    <span className="font-medium">{listing.engagement?.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inspections:</span>
                    <span className="font-medium">{listing.engagement?.inspections || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inquiries:</span>
                    <span className="font-medium">{listing.engagement?.inquiries || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
