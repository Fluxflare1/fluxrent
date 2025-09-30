// frontend/app/properties/page.tsx
"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import PropertyCard from "@/components/property/PropertyCard";
import MapView from "@/components/listings/MapView";
import FiltersPanel from "@/components/listings/FiltersPanel";
import { Grid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PropertiesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [loading, setLoading] = useState(true);

  async function loadListings(filters = {}) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: "1",
        page_size: "12",
        ...filters
      });
      
      const res = await fetch(`${API_BASE_URL}/api/properties/listings/?${params}`);
      if (!res.ok) throw new Error("Failed to fetch listings");
      
      const data = await res.json();
      setListings(data.results || data);
    } catch (error) {
      console.error("Error loading listings:", error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, []);

  const handleFilterChange = (filters: any) => {
    loadListings(filters);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Available Properties</h1>
          <p className="text-gray-600 mt-1">
            {listings.length} {listings.length === 1 ? 'property' : 'properties'} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" />
            Map
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <FiltersPanel onFilterChange={handleFilterChange} />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <MapView listings={listings} height="h-[600px]" />
          )}

          {/* Empty State */}
          {listings.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more properties</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
