// frontend/components/landing/LandingFeatures.tsx
export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold mb-6">Key features for busy managers</h2>
        <p className="text-slate-600 mb-10 max-w-2xl mx-auto">
          Built around the real needs of property teams and tenants — billing, communication, documentation and reporting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            title="Property & Unit Tracking"
            description="Maintain inventories, leases and tenant assignments in one place."
            emoji="🏢"
          />
          <FeatureCard
            title="Payments & Receipts"
            description="Record payments, generate receipts and track outstanding balances."
            emoji="💳"
          />
          <FeatureCard
            title="Tickets & Communication"
            description="Open maintenance tickets, message tenants, and log activity."
            emoji="✉️"
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, emoji }: { title: string; description: string; emoji: string }) {
  return (
    <div className="p-6 border rounded-lg text-left shadow-sm hover:shadow-md transition">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
