// frontend/app/properties/page.tsx
"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL, fetchListings, ListingFilters } from "@/lib/api";
import PropertyCard from "@/components/property/PropertyCard";
import MapView from "@/components/listings/MapView";
import FiltersPanel from "@/components/listings/FiltersPanel";
import { Grid, Map, List } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "grid" | "map" | "list";

export default function PropertiesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({});

  async function loadListings(currentFilters: ListingFilters = {}) {
    setLoading(true);
    try {
      // Use fetchListings from API if available, otherwise fallback to direct fetch
      let data;
      try {
        data = await fetchListings({
          page: "1",
          page_size: "12",
          ...currentFilters
        });
      } catch {
        // Fallback to direct fetch if fetchListings fails
        const params = new URLSearchParams({
          page: "1",
          page_size: "12",
          ...currentFilters
        });
        
        const res = await fetch(`${API_BASE_URL}/api/properties/listings/?${params}`);
        if (!res.ok) throw new Error("Failed to fetch listings");
        
        data = await res.json();
      }
      
      setListings(data.results || data);
      setFilters(currentFilters);
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

  const handleFilterChange = (newFilters: any) => {
    loadListings(newFilters);
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
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List
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
          <FiltersPanel 
            onFilterChange={handleFilterChange} 
            initial={filters}
          />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Properties</h3>
              <ul className="space-y-3">
                {listings.map((property) => (
                  <li key={property.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-lg">{property.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {property.currency || '₦'} {property.price?.toLocaleString()} — {property.listing_type || property.property_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {property.bedrooms || 0} bed / {property.bathrooms || 0} bath / {property.toilets || 0} toilet
                        </p>
                        {property.address && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{property.address}</p>
                        )}
                      </div>
                      {property.media?.[0]?.file && (
                        <img 
                          src={property.media[0].file} 
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Map View */}
          {viewMode === "map" && (
            <div className="flex flex-col gap-6">
              <MapView listings={listings} height="h-[500px]" />
              
              {/* Property List below Map */}
              <div className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-4 text-lg">Properties in this area</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {listings.slice(0, 4).map((property) => (
                    <div key={property.id} className="border p-3 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-800">{property.title}</h4>
                      <p className="text-sm text-gray-600">
                        {property.currency || '₦'} {property.price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {property.bedrooms || 0} bed / {property.bathrooms || 0} bath
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
