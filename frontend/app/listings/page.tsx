// app/(listings)/page.tsx
"use client"

import { useState, useEffect } from "react"
import { API_BASE_URL, fetchListings, ListingFilters } from "@/lib/api"
import PropertyCard from "@/components/property/PropertyCard"
import MapView from "@/components/listings/MapView"
import FiltersPanel from "@/components/listings/FiltersPanel"
import { Grid, Map, List } from "lucide-react"
import { Button } from "@/components/ui/button"

type ViewMode = "grid" | "map" | "list"

export default function ListingsHubPage() {
  const [listings, setListings] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ListingFilters>({})

  async function loadListings(currentFilters: ListingFilters = {}) {
    setLoading(true)
    try {
      let data = await fetchListings({ page: "1", page_size: "12", ...currentFilters }).catch(async () => {
        const params = new URLSearchParams({ page: "1", page_size: "12", ...currentFilters })
        const res = await fetch(`${API_BASE_URL}/api/properties/listings/?${params}`)
        if (!res.ok) throw new Error("Failed to fetch listings")
        return await res.json()
      })
      setListings(data.results || data)
      setFilters(currentFilters)
    } catch (err) {
      console.error("Error loading listings:", err)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

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
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header + View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Explore Listings</h1>
          <p className="text-gray-600 mt-1">
            {listings.length} {listings.length === 1 ? "property" : "properties"} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["grid", "list", "map"] as ViewMode[]).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-2"
            >
              {mode === "grid" && <Grid className="h-4 w-4" />}
              {mode === "list" && <List className="h-4 w-4" />}
              {mode === "map" && <Map className="h-4 w-4" />}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <FiltersPanel onFilterChange={loadListings} initial={filters} />
        </aside>

        {/* Listings Content */}
        <main className="lg:col-span-3">
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="bg-white border rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-4 text-lg">Properties</h3>
              <ul className="space-y-3">
                {listings.map((property) => (
                  <li
                    key={property.id}
                    className="border p-4 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-lg">{property.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {property.currency || "₦"} {property.price?.toLocaleString()} —{" "}
                          {property.listing_type || property.property_type}
                        </p>
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

          {viewMode === "map" && (
            <div className="flex flex-col gap-6">
              <MapView listings={listings} height="h-[500px]" />
            </div>
          )}

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
  )
}
