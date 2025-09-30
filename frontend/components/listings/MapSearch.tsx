// frontend/components/listings/MapSearch.tsx
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import MapView from "./MapView";
import { useDebouncedCallback } from "use-debounce";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/api"; // you must export this in lib/api or replace with process.env...

interface Listing {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location?: { coordinates: [number, number] };
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
}

type Props = {
  initialListings?: Listing[];
  initialCenter?: [number, number];
  initialZoom?: number;
};

export default function MapSearch({ initialListings = [], initialCenter = [6.5244, 3.3792], initialZoom = 11 }: Props) {
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [bounds, setBounds] = useState<{ sw_lng: number; sw_lat: number; ne_lng: number; ne_lat: number } | null>(null);

  // Filter state
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [listingType, setListingType] = useState<string | "">("");
  const [bedrooms, setBedrooms] = useState<number | "">("");

  // build query
  const buildQuery = useCallback(
    (p = page) => {
      const params: string[] = [];
      if (bounds) {
        params.push(`bounds=${bounds.sw_lng},${bounds.sw_lat},${bounds.ne_lng},${bounds.ne_lat}`);
      }
      if (minPrice !== "") params.push(`min_price=${minPrice}`);
      if (maxPrice !== "") params.push(`max_price=${maxPrice}`);
      if (listingType) params.push(`listing_type=${encodeURIComponent(listingType)}`);
      if (bedrooms !== "") params.push(`bedrooms=${bedrooms}`);
      params.push(`page=${p}`);
      return params.length ? `?${params.join("&")}` : "";
    },
    [bounds, minPrice, maxPrice, listingType, bedrooms, page]
  );

  const fetchListings = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const q = buildQuery(p);
        const res = await fetch(`${API_BASE_URL}/api/properties/listings/${q}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const payload = await res.json();
        // payload is DRF paginated response: {count, next, previous, results}
        const results = payload.results || payload;
        setListings(results);
        // compute total pages if count/page_size
        if (payload.count && payload.results) {
          const pageSize = payload.results.length || 1;
          setTotalPages(Math.ceil(payload.count / pageSize));
        } else {
          setTotalPages(1);
        }
      } catch (err: any) {
        toast({ title: "Search failed", description: err?.message || "Unable to load listings" });
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, toast]
  );

  // Debounce fetch on bounds/filter changes to avoid too many requests
  const [debouncedFetch] = useDebouncedCallback((p: number) => fetchListings(p), 400);

  // When page changes, fetch
  useEffect(() => {
    fetchListings(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // When filters or bounds change, reset to page 1 and fetch (debounced)
  useEffect(() => {
    setPage(1);
    debouncedFetch(1);
  }, [bounds, minPrice, maxPrice, listingType, bedrooms, debouncedFetch]);

  // Handler for map bounds changed
  const handleBoundsChange = useCallback((b: { sw_lng: number; sw_lat: number; ne_lng: number; ne_lat: number }) => {
    setBounds(b);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <aside className="col-span-1 border rounded p-4">
        <h3 className="font-bold mb-3">Search & Filters</h3>

        <label className="text-xs">Min price (NGN)</label>
        <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 border rounded mb-2" />

        <label className="text-xs">Max price (NGN)</label>
        <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 border rounded mb-2" />

        <label className="text-xs">Listing type</label>
        <select value={listingType} onChange={(e) => setListingType(e.target.value)} className="w-full p-2 border rounded mb-2">
          <option value="">Any</option>
          <option value="RENT">Rent</option>
          <option value="LEASE">Lease</option>
          <option value="SALE">Sale</option>
          <option value="SERVICE_APARTMENT">Service Apartment</option>
          <option value="LAND">Land</option>
        </select>

        <label className="text-xs">Min bedrooms</label>
        <input type="number" value={bedrooms as any} onChange={(e) => setBedrooms(e.target.value ? Number(e.target.value) : "")} className="w-full p-2 border rounded mb-2" />

        <div className="mt-4">
          <button className="btn btn-primary w-full" onClick={() => fetchListings(1)}>
            Apply filters
          </button>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold">Results</h4>
          <div className="text-sm text-gray-600">{loading ? "Loading..." : `${listings.length} listings`}</div>
          <ul className="space-y-3 mt-3">
            {listings.map((l) => (
              <li key={l.id} className="border rounded p-2">
                <Link href={`/properties/listings/${l.id}`} className="font-semibold block">
                  {l.title}
                </Link>
                <div className="text-xs text-gray-600">{l.address}</div>
                <div className="text-sm font-medium mt-1">{l.price?.toLocaleString ? `₦ ${l.price.toLocaleString()}` : l.price}</div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <button className="px-2 py-1 border rounded" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Prev
            </button>
            <div className="text-sm">
              Page {page} / {totalPages}
            </div>
            <button className="px-2 py-1 border rounded" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </aside>

      <section className="col-span-2">
        <MapView listings={listings} center={initialCenter} zoom={initialZoom} height="h-[70vh]" onBoundsChange={handleBoundsChange} />
      </section>
    </div>
  );
}
