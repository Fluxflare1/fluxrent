"use client";
import { useEffect, useState } from "react";
import { apiFetch, ENDPOINTS } from "@/lib/api";
import PropertyCard from "@/components/property/PropertyCard";

export default function PropertiesPage() {
  const [listings, setListings] = useState<any[]>([]);

  async function load() {
    const res = await apiFetch(ENDPOINTS.listings.search);
    setListings(res.results || res);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {listings.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}
