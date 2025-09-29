// frontend/components/listings/MapView.tsx
"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/dist/styles.min.css";
import L from "leaflet";
import Link from "next/link";
import { useMemo, useState } from "react";

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
  currency?: string;
  location?: {
    coordinates: [number, number]; // [lng, lat]
  };
  address?: string;
}

interface MapViewProps {
  listings: Listing[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  height?: string;
  className?: string;
}

export default function MapView({ 
  listings, 
  center = [6.5244, 3.3792], 
  zoom = 11,
  height = "h-96",
  className = ""
}: MapViewProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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

  const handleMapCreated = (mapInstance: L.Map) => {
    setMap(mapInstance);
    setIsMapReady(true);
    
    if (bounds && bounds.length > 0) {
      // Small delay to ensure map is fully initialized
      setTimeout(() => {
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
      }, 100);
    }
  };

  const formatCurrency = (price: number, currency?: string) => {
    const symbols: { [key: string]: string } = {
      NGN: "₦",
      USD: "$",
      GBP: "£",
      EUR: "€"
    };
    const symbol = currency ? symbols[currency] || currency : "₦";
    return `${symbol} ${price.toLocaleString()}`;
  };

  // Filter out listings without valid coordinates
  const validListings = useMemo(() => 
    listings.filter(listing => listing.location?.coordinates),
    [listings]
  );

  if (!isMapReady) {
    return (
      <div className={`w-full ${height} rounded-lg overflow-hidden border shadow-md bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${height} rounded-lg overflow-hidden border shadow-md ${className}`}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: "100%", width: "100%" }} 
        whenCreated={handleMapCreated}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
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
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">{listing.title}</h3>
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
          // Single marker for center when no listings
          <Marker position={center}>
            <Popup>
              <div className="text-sm">
                No properties found in this area
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
