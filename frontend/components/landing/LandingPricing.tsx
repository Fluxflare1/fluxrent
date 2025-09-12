// frontend/components/landing/LandingPricing.tsx
export default function LandingPricing() {
  return (
    <section id="pricing" className="py-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">Simple pricing</h2>
        <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
          Start small and upgrade when you need more properties or advanced features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-8 bg-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Property Manager</h3>
            <div className="text-4xl font-extrabold mb-4">$29 <span className="text-base font-medium">/ month</span></div>
            <ul className="text-slate-600 mb-6 space-y-2 text-left">
              <li>✔ Manage up to 10 properties</li>
              <li>✔ Rent collection & receipts</li>
              <li>✔ Tenant messaging</li>
            </ul>
            <a href="/login" className="inline-block px-6 py-2 bg-blue-900 text-white rounded">Request Access</a>
          </div>

          <div className="p-8 bg-blue-900 text-white rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Enterprise</h3>
            <div className="text-3xl font-extrabold mb-4">Custom</div>
            <ul className="mb-6 space-y-2 text-left">
              <li>✔ Unlimited properties</li>
              <li>✔ Custom workflows</li>
              <li>✔ Priority support</li>
            </ul>
            <a href="/contact" className="inline-block px-6 py-2 bg-yellow-400 text-blue-900 rounded">Contact Sales</a>
          </div>
        </div>
      </div>
    </section>
  );
}
