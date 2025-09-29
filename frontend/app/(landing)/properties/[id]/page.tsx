import { fetchListingServer } from "@/lib/api";
import ListingDetail from "@/components/listings/ListingDetail";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const listing = await fetchListingServer(params.id);
  return {
    title: `${listing.title} | FluxRent`,
    description: listing.short_description || listing.description,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await fetchListingServer(params.id);

  return (
    <main className="max-w-7xl mx-auto p-6">
      <ListingDetail listing={listing} />
    </main>
  );
}
