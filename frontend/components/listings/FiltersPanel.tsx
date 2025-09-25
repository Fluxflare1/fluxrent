// frontend/components/listings/FiltersPanel.tsx
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import qs from "qs";

const defaultPageSize = 12;

export default function FiltersPanel({ initial }: { initial?: Record<string, any> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const getParam = (k: string) => searchParams?.get(k) ?? "";

  const [q, setQ] = useState(getParam("q") || "");
  const [listingType, setListingType] = useState(getParam("listing_type") || "");
  const [minPrice, setMinPrice] = useState(getParam("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(getParam("max_price") || "");
  const [bedrooms, setBedrooms] = useState(getParam("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(getParam("bathrooms") || "");
  const [radius, setRadius] = useState(getParam("radius") || "10"); // km
  const [lat, setLat] = useState(getParam("lat") || "");
  const [lng, setLng] = useState(getParam("lng") || "");

  useEffect(() => {
    // sync initial values if provided
    if (initial) {
      setQ(initial.q || "");
      setListingType(initial.listing_type || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (overrides: Record<string, any> = {}) => {
    const current = Object.fromEntries(Array.from(searchParams || new URLSearchParams()));
    const next = {
      page: 1,
      page_size: defaultPageSize,
      q,
      listing_type: listingType || undefined,
      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      bedrooms: bedrooms || undefined,
      bathrooms: bathrooms || undefined,
      radius: radius || undefined,
      lat: lat || undefined,
      lng: lng || undefined,
      ...overrides,
    };
    // remove falsy
    const cleaned: Record<string, any> = {};
    Object.entries(next).forEach(([k, v]) => {
      if (v !== undefined && v !== "") cleaned[k] = v;
    });

    const qsStr = qs.stringify(cleaned, { addQueryPrefix: true, arrayFormat: "brackets" });
    router.push(`/properties${qsStr}`);
  };

  // debounce search
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedApply = debounce(() => applyFilters(), 400);

  useEffect(() => {
    // update on search q change with debounce
    debouncedApply();
    return () => debouncedApply.cancel();
  }, [q, listingType, minPrice, maxPrice, bedrooms, bathrooms, radius, lat, lng]);

  const onClear = () => {
    router.push("/properties");
  };

  const onUseMyLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
        // apply afterwards
        applyFilters({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => alert("Could not get your location")
    );
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow-sm">
      <div>
        <label className="sr-only">Search</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, location, description..."
          className="w-full border rounded-md px-3 py-2"
          aria-label="Search listings"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <select value={listingType} onChange={(e) => setListingType(e.target.value)} className="border rounded-md p-2">
          <option value="">All types</option>
          <option value="RENT">Rent</option>
          <option value="LEASE">Lease</option>
          <option value="SALE">Sale</option>
          <option value="SERVICE_APARTMENT">Service Apartment</option>
          <option value="LAND">Land</option>
        </select>

        <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="border rounded-md p-2">
          <option value="">Bedrooms</option>
          <option value="0">Studio</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price" className="border rounded-md p-2" />
        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className="border rounded-md p-2" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input value={lat} onChange={(e) => setLat(e.target.value)} placeholder="Lat" className="border rounded-md p-2" />
        <input value={lng} onChange={(e) => setLng(e.target.value)} placeholder="Lng" className="border rounded-md p-2" />
      </div>

      <div className="flex items-center gap-2">
        <input value={radius} onChange={(e) => setRadius(e.target.value)} className="w-20 border rounded-md p-2" />
        <div className="text-sm text-gray-600">km radius</div>
        <button onClick={onUseMyLocation} className="ml-auto text-sm text-blue-600">Use My Location</button>
      </div>

      <div className="flex gap-2">
        <button onClick={() => applyFilters()} className="flex-1 bg-blue-600 text-white py-2 rounded-md">Apply</button>
        <button onClick={onClear} className="flex-1 border rounded-md py-2">Reset</button>
      </div>
    </div>
  );
}
