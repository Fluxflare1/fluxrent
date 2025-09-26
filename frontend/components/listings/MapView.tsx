"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";
import Link from "next/link";
import { useMemo } from "react";

// Fix default icon issue for Leaflet
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
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface MapViewProps {
  listings: Listing[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
}

export default function MapView({ 
  listings, 
  center = [6.5244, 3.3792], 
  zoom = 11 
}: MapViewProps) {
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

  const handleMapCreated = (map: L.Map) => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border shadow-md">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }} 
        whenCreated={handleMapCreated}
        scrollWheelZoom={false}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup 
          chunkedLoading
          maxClusterRadius={50}
        >
          {listings.map((listing) => {
            if (!listing.location?.coordinates) return null;
            
            const [lng, lat] = listing.location.coordinates;
            return (
              <Marker key={listing.id} position={[lat, lng]}>
                <Popup>
                  <div className="max-w-xs p-1">
                    <div className="font-semibold text-sm mb-1">{listing.title}</div>
                    <div className="text-xs text-gray-600 mb-2">
                      ₦{Number(listing.price).toLocaleString()}
                    </div>
                    <Link 
                      href={`/properties/${listing.id}`} 
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                    >
                      View listing →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
