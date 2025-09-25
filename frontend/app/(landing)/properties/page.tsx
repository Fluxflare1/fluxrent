import { fetchListings } from "@/lib/api";
import ListingGrid from "@/components/listings/ListingGrid";

export const metadata = {
  title: "Browse Properties | FluxRent",
  description: "Find rental, lease, and sale properties near you.",
};

export default async function PropertiesPage() {
  const listings = await fetchListings();

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Available Properties</h1>
      <ListingGrid listings={listings.results || listings} />
    </main>
  );
}
