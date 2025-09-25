// frontend/components/listings/MapView.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useMemo } from "react";

// fix default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({ listings, center = [6.5244, 3.3792], zoom = 11 }: { listings: any[]; center?: [number, number]; zoom?: number; }) {
  const bounds = useMemo(() => {
    try {
      const pts = listings
        .map((l) => l.location && l.location.coordinates ? [l.location.coordinates[1], l.location.coordinates[0]] : null)
        .filter(Boolean) as [number, number][];
      return pts.length ? pts : null;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} whenCreated={(map) => { if (bounds && bounds.length) map.fitBounds(bounds); }}>
        <TileLayer attribution='&copy; <a href="https://osm.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {listings.map((l) => {
          if (!l.location?.coordinates) return null;
          const [lng, lat] = l.location.coordinates;
          return (
            <Marker key={l.id} position={[lat, lng]}>
              <Popup>
                <div className="max-w-xs">
                  <div className="font-semibold">{l.title}</div>
                  <div className="text-sm text-gray-600">₦{Number(l.price).toLocaleString()}</div>
                  <div className="mt-2">
                    <Link href={`/properties/${l.id}`} className="text-blue-600 text-sm">View listing</Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
