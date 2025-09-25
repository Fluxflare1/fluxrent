import { fetchListing } from "@/lib/api";
import ListingDetail from "@/components/listings/ListingDetail";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props) {
  const listing = await fetchListing(params.id);
  return {
    title: `${listing.title} | FluxRent`,
    description: listing.description,
  };
}

export default async function ListingDetailPage({ params }: Props) {
  const listing = await fetchListing(params.id);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <ListingDetail listing={listing} />
    </main>
  );
}
