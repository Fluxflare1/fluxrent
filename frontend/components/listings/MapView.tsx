// frontend/components/listings/MapView.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

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
  property_uid?: string;
}

interface MapViewProps {
  listings: Listing[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  height?: string;
  className?: string;
  onBoundsChange?: (bounds: { sw_lng: number; sw_lat: number; ne_lng: number; ne_lat: number }) => void;
}

function MapEvents({ onBoundsChange }: { onBoundsChange?: MapViewProps["onBoundsChange"] }) {
  const map = useMapEvents({
    moveend: () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      // Leaflet LatLngBounds -> southwest (lat,lng) & northeast (lat,lng)
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      onBoundsChange({
        sw_lng: sw.lng,
        sw_lat: sw.lat,
        ne_lng: ne.lng,
        ne_lat: ne.lat,
      });
    },
    zoomend: () => {
      if (!onBoundsChange) return;
      const b = map.getBounds();
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      onBoundsChange({
        sw_lng: sw.lng,
        sw_lat: sw.lat,
        ne_lng: ne.lng,
        ne_lat: ne.lat,
      });
    },
  });
  return null;
}

export default function MapView({
  listings,
  center = [6.5244, 3.3792],
  zoom = 11,
  height = "h-96",
  className = "",
  onBoundsChange,
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);

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

  useEffect(() => {
    if (!map || !bounds) return;
    setTimeout(() => {
      try {
        map.fitBounds(bounds as any, { padding: [20, 20] });
      } catch (e) {
        // ignore
      }
    }, 100);
  }, [map, bounds]);

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
        whenCreated={(m) => setMap(m)}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onBoundsChange={onBoundsChange} />

        {validListings.length > 0 ? (
          <MarkerClusterGroup chunkedLoading maxClusterRadius={50} spiderfyOnMaxZoom showCoverageOnHover={false}>
            {validListings.map((listing) => {
              const [lng, lat] = listing.location!.coordinates;
              return (
                <Marker key={listing.id} position={[lat, lng]}>
                  <Popup>
                    <div className="max-w-xs p-2">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{listing.title}</h3>
                      <div className="text-xs text-gray-600 mb-2">{formatCurrency(listing.price, listing.currency)}</div>
                      {listing.address && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{listing.address}</p>
                      )}
                      <Link href={`/properties/listings/${listing.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center">
                        View details →
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        ) : (
          <Marker position={center}>
            <Popup>
              <div className="text-sm">No properties found in this area</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
