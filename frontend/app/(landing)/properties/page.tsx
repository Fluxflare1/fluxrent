// app/(landing)/properties/page.tsx
import { fetchListingsServer } from "@/lib/api";
import ListingGrid from "@/components/listings/ListingGrid";
import FiltersPanel from "@/components/listings/FiltersPanel";
import Pagination from "@/components/listings/Pagination";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/listings/MapView"), { ssr: false });

export const metadata = {
  title: "Properties — Browse | FluxRent",
  description: "Search and filter properties for rent, lease, and sale.",
};

interface Props {
  searchParams?: Record<string, string>;
}

export default async function PropertiesPage({ searchParams = {} }: Props) {
  // Check if this is a filtered request or simple listing
  const hasFilters = Object.keys(searchParams).length > 0;
  
  // Map Next.js searchParams -> backend query params
  const page = parseInt((searchParams.page as string) || "1", 10) || 1;
  const page_size = parseInt((searchParams.page_size as string) || "12", 10) || 12;
  
  const params: Record<string, any> = {
    page,
    page_size,
    q: searchParams.q,
    listing_type: searchParams.listing_type, // Fixed: was model_type in new code
    min_price: searchParams.min_price,
    max_price: searchParams.max_price,
    bedrooms: searchParams.bedrooms,
    bathrooms: searchParams.bathrooms,
    lat: searchParams.lat,
    lng: searchParams.lng,
    radius: searchParams.radius,
  };

  // Use server-side fetch for better performance
  const data = await fetchListingsServer(hasFilters ? params : undefined).catch((err) => {
    console.error("Fetch listings failed", err);
    return { results: [], count: 0 };
  });

  const listings = data.results || data;
  const total_count = data.count ?? (Array.isArray(data) ? data.length : 0);

  // Simple layout for no filters, advanced layout for filtered searches
  if (!hasFilters) {
    return (
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Available Properties</h1>
        <ListingGrid listings={listings} />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 grid lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1">
        <FiltersPanel initial={searchParams} />
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Map</h4>
          <div>
            <MapView listings={listings} />
          </div>
        </div>
      </aside>

      <section className="lg:col-span-3">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Listings</h1>
          <div className="text-sm text-gray-600">{total_count} results</div>
        </div>

        <ListingGrid listings={listings} />

        <Pagination page={page} page_size={page_size} total_count={total_count} />
      </section>
    </main>
  );
}
