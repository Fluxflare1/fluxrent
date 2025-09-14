export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <h1 className="text-xl font-bold text-red-600">
        ❌ You are not authorized to view this page.
      </h1>
    </div>
  );
}
