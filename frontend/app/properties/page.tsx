// frontend/app/properties/page.tsx
import { API_BASE_URL } from "@/lib/api";
import PropertyCard from "@/components/property/PropertyCard";

export const metadata = {
  title: "Properties — Browse | FluxRent",
  description: "Search and filter properties for rent, lease, and sale.",
};

async function fetchInitialListings() {
  const res = await fetch(`${API_BASE_URL}/api/properties/listings/?page=1`, { 
    next: { revalidate: 60 } 
  });
  
  if (!res.ok) {
    return [];
  }
  
  const payload = await res.json();
  return payload.results || payload;
}

export default async function PropertiesPage() {
  const listings = await fetchInitialListings();

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {listings.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
