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

export const metadata = {
  title: "Browse Properties | Checkalist",
  description:
    "Discover apartments, houses, and commercial properties for rent or sale on Checkalist — a simple and fast listings hub.",
}

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ListingFilters>({})

  async function loadListings(currentFilters: ListingFilters = {}) {
    setLoading(true)
    try {
      let data
      try {
        data = await fetchListings({ page: "1", page_size: "12", ...currentFilters })
      } catch {
        const params = new URLSearchParams({ page: "1", page_size: "12", ...currentFilters })
        const res = await fetch(`${API_BASE_URL}/api/properties/listings/?${params}`)
        if (!res.ok) throw new Error("Failed to fetch listings")
        data = await res.json()
      }
      setListings(data.results || data)
      setFilters(currentFilters)
    } catch (error) {
      console.error("Error loading listings:", error)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  const handleFilterChange = (newFilters: any) => {
    loadListings(newFilters)
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Checkalist Listings</h1>
          <p className="text-gray-600 mt-1">
            {listings.length} {listings.length === 1 ? "property" : "properties"} found
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" /> Grid
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" /> List
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("map")}
            className="flex items-center gap-2"
          >
            <Map className="h-4 w-4" /> Map
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <FiltersPanel onFilterChange={handleFilterChange} initial={filters} />
        </aside>

        {/* Main */}
        <main className="lg:col-span-3">
          {viewMode === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="space-y-4">
              {listings.map((property) => (
                <div
                  key={property.id}
                  className="border p-4 rounded-lg hover:shadow-md transition-shadow flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-semibold text-lg">{property.title}</h4>
                    <p className="text-sm text-gray-600">
                      {property.currency || "₦"} {property.price?.toLocaleString()}
                    </p>
                  </div>
                  {property.media?.[0]?.file && (
                    <img
                      src={property.media[0].file}
                      alt={property.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {viewMode === "map" && (
            <div className="flex flex-col gap-6">
              <MapView listings={listings} height="h-[500px]" />
              <div className="grid md:grid-cols-2 gap-4">
                {listings.slice(0, 4).map((property) => (
                  <div
                    key={property.id}
                    className="border p-3 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-medium text-gray-800">{property.title}</h4>
                    <p className="text-sm text-gray-600">
                      {property.currency || "₦"} {property.price?.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
