"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import { fetchListings, ListingFilters } from "@/lib/api";
import Link from "next/link";

/* Fix default Leaflet icon when bundling (use CDN paths to avoid image import setup) */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Listing {
  id: string;
  title?: string;
  price?: number;
  currency?: string;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
}

interface MapViewProps {
  filters?: ListingFilters;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
}

function MarkerClusterLayer({ markers }: { markers: { lat: number; lng: number; popup?: string }[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !(L as any).markerClusterGroup) return;

    const group = (L as any).markerClusterGroup();
    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng]);
      if (m.popup) marker.bindPopup(String(m.popup));
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      if (map.hasLayer(group)) map.removeLayer(group);
    };
  }, [map, markers]);

  return null;
}

export default function MapView({
  filters = {},
  center = [6.5244, 3.3792],
  zoom = 11,
  height = "h-96",
  className = "",
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  const loadListings = useCallback(
    async (extra: Partial<ListingFilters> = {}) => {
      try {
        setLoading(true);
        const data = await fetchListings({ ...(filters || {}), ...(extra || {}) });
        setListings(data.results || data);
      } catch (err) {
        console.error("Failed to load listings:", err);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  function MapEvents() {
    useMapEvents({
      moveend: () => {
        if (!map) return;
        const bounds = map.getBounds();
        const c = map.getCenter();
        const radius = c.distanceTo(bounds.getNorthEast()) / 1000; // km
        loadListings({ lat: c.lat, lng: c.lng, radius: Math.round(radius) } as any);
      },
    });
    return null;
  }

  const validListings = useMemo(
    () =>
      listings
        .map((l) => {
          if (!l.location?.coordinates) return null;
          const [lng, lat] = l.location.coordinates;
          return { id: l.id, title: l.title, price: l.price, currency: l.currency, lat, lng, address: l.address } as any;
        })
        .filter(Boolean),
    [listings]
  );

  const formatCurrency = (price?: number, currency?: string) => {
    if (price == null) return "";
    const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" };
    const symbol = currency ? symbols[currency] || currency : "₦";
    return `${symbol} ${price.toLocaleString()}`;
  };

  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden border shadow-md ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        whenCreated={setMap}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={true}
        className="leaflet-container"
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
          <MarkerClusterLayer
            markers={validListings.map((v) => ({
              lat: v.lat,
              lng: v.lng,
              popup: `<div class="max-w-xs p-2"><h3 class="font-semibold text-sm mb-1">${String(v.title || "")}</h3><div class="text-xs text-gray-600 mb-2">${formatCurrency(v.price, v.currency)}</div><p class="text-xs text-gray-500 mb-2">${String(v.address || "")}</p><a href="/listings/${v.id}" class="text-blue-600 text-xs font-medium">View details →</a></div>`,
            }))}
          />
        ) : (
          !loading && <Marker position={center}><Popup>No properties found in this area</Popup></Marker>
        )}
      </MapContainer>
    </div>
  );
}
