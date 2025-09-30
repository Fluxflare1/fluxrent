// frontend/components/listings/MapView.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";
import Link from "next/link";
import { fetchListings, ListingFilters } from "@/lib/api";

// Fix default Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Listing {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
}

interface MapViewProps {
  filters?: ListingFilters; // external filters (price, property_type, etc.)
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

export default function MapView({
  filters = {},
  center = [6.5244, 3.3792], // default: Lagos
  zoom = 11,
  height = "h-96",
  className = "",
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch listings with filters + bounds
  const loadListings = useCallback(
    async (extraFilters: Partial<ListingFilters> = {}) => {
      try {
        setLoading(true);
        const data = await fetchListings({ ...filters, ...extraFilters });
        setListings(data.results || data); // DRF pagination OR plain array
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Fetch on initial load + when filters change
  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Hook to capture map moves and reload listings
  function MapEvents() {
    useMapEvents({
      moveend: () => {
        if (!map) return;
        const bounds = map.getBounds();
        const center = map.getCenter();
        const radius = center.distanceTo(bounds.getNorthEast()) / 1000; // in km

        loadListings({
          lat: center.lat,
          lng: center.lng,
          radius: Math.round(radius),
        });
      },
    });
    return null;
  }

  const bounds = useMemo(() => {
    try {
      const validPoints = listings
        .map((listing) => {
          if (!listing.location?.coordinates) return null;
          const [lng, lat] = listing.location.coordinates;
          return [lat, lng] as [number, number];
        })
        .filter(Boolean) as [number, number][];
      return validPoints.length > 0 ? validPoints : null;
    } catch (error) {
      console.error("Error calculating map bounds:", error);
      return null;
    }
  }, [listings]);

  const formatCurrency = (price: number, currency?: string) => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€",
    };
    const symbol = currency ? symbols[currency] || currency : "₦";
    return `${symbol} ${price.toLocaleString()}`;
  };

  // Filter out invalid listings
  const validListings = useMemo(
    () => listings.filter((listing) => listing.location?.coordinates),
    [listings]
  );

  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden border shadow-md ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        whenCreated={setMap}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents />

        {loading && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded shadow text-sm text-gray-600">
            Loading properties...
          </div>
        )}

        {validListings.length > 0 ? (
          <MarkerClusterGroup
            chunkedLoading
            maxClusterRadius={50}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
          >
            {validListings.map((listing) => {
              const [lng, lat] = listing.location!.coordinates;
              return (
                <Marker key={listing.id} position={[lat, lng]}>
                  <Popup>
                    <div className="max-w-xs p-2">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {listing.title}
                      </h3>
                      <div className="text-xs text-gray-600 mb-2">
                        {formatCurrency(listing.price, listing.currency)}
                      </div>
                      {listing.address && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {listing.address}
                        </p>
                      )}
                      <Link
                        href={`/listings/${listing.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center"
                      >
                        View details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        ) : (
          !loading && (
            <Marker position={center}>
              <Popup>
                <div className="text-sm">No properties found in this area</div>
              </Popup>
            </Marker>
          )
        )}
      </MapContainer>
    </div>
  );
}
