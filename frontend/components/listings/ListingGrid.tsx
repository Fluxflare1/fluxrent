// frontend/components/listings/ListingGrid.tsx
"use client";

import ListingCard from "./ListingCard";

interface ListingGridProps {
  listings: any[];
  variant?: "card" | "compact";
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function ListingGrid({ 
  listings, 
  variant = "card", 
  loading = false,
  emptyMessage = "No properties found",
  className = ""
}: ListingGridProps) {
  // Loading state
  if (loading) {
    return (
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-2xl mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!listings?.length) {
    return (
      <div className="py-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4m0 4h4m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
        <p className="text-gray-500 max-w-sm mx-auto">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {listings.map((listing) => (
        <ListingCard 
          key={listing.id} 
          listing={listing} 
          variant={variant}
        />
      ))}
    </div>
  );
}
