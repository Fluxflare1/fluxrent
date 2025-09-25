// app/page.tsx
import Link from "next/link";

export default function Landing() {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
      <section className="p-8">
        <h1 className="text-4xl font-extrabold mb-4">FluxRent — Property & Tenant Platform</h1>
        <p className="text-lg text-slate-600 mb-6">
          List properties, manage tenants, and collect payments — all from a unified platform.
        </p>

        <div className="flex gap-3">
          <Link href="/auth/login" className="inline-block px-6 py-3 bg-primary-500 text-white rounded shadow">
            Login
          </Link>
          <Link href="/auth/request-access" className="inline-block px-6 py-3 border border-slate-200 rounded">
            Request Access
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Why FluxRent?</h3>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Unified wallet & payments for tenants and managers</li>
            <li>Property listings, search, and inspection flow</li>
            <li>Easy reconciliation and audit-ready payment records</li>
          </ul>
        </div>
      </section>

      <section className="p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Explore Listings</h2>
        <p className="text-slate-600 mb-6">Search by location, price, bedrooms or features.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 border rounded">
            <h4 className="font-semibold">Stylish 2BR Apartment</h4>
            <p className="text-slate-500 text-sm mt-1">Lekki Phase 1 — ₦450,000 / year</p>
          </div>
          <div className="p-3 border rounded">
            <h4 className="font-semibold">Commercial Space</h4>
            <p className="text-slate-500 text-sm mt-1">Ikeja — ₦1,200,000 / year</p>
          </div>
        </div>

        <div className="mt-6">
          <Link href="/properties/listings" className="inline-block px-4 py-2 border rounded">
            Browse all listings
          </Link>
        </div>
      </section>
    </div>
  );
}
