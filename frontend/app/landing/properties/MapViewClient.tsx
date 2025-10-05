'use client';

import dynamic from "next/dynamic";

const MapViewClient = dynamic(
  () => import("@/components/listings/MapView"),
  { 
    ssr: false,
    loading: () => <div className="h-64 bg-gray-100 rounded flex items-center justify-center">Loading map...</div>
  }
);

export default MapViewClient;
