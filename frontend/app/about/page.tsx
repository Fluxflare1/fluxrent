// frontend/app/about/page.tsx
export const metadata = {
  title: "About FluxRent",
  description: "About our tenant & property management platform",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold mb-4">About FluxRent</h1>
        <p className="text-slate-700 mb-8">
          FluxRent is built to simplify everyday property operations — from rent collection and receipts to tenant communication and maintenance tracking.
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-slate-600">Reduce administrative overhead for property teams and bring clarity to tenant interactions.</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">How we help</h2>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Centralize units, leases and tenant records</li>
            <li>Simplify payment tracking and receipts</li>
            <li>Streamline maintenance requests and communication</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Get started</h2>
          <p className="text-slate-600 mb-4">Admins create Property Managers who then onboard properties and tenants. If you’re a property manager, request access via the Login page.</p>
          <a href="/login" className="inline-block px-6 py-2 bg-blue-900 text-white rounded">Login / Request Access</a>
        </section>
      </div>
    </div>
  );
}
