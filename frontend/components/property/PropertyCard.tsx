export default function PropertyCard({ property }: { property: any }) {
  const expired = property.expires_at && new Date(property.expires_at) < new Date();

  return (
    <div className={`border rounded p-4 shadow ${expired ? "opacity-50" : ""}`}>
      <h3 className="font-semibold">{property.title}</h3>
      <p>{property.description}</p>
      <p className="text-sm text-gray-500">{property.location}</p>
      <p className="font-medium">₦{property.price}</p>

      {expired && <p className="text-red-600 font-medium">Expired (upgrade to republish)</p>}
    </div>
  );
}
