// frontend/components/landing/LandingFeatures.tsx
export default function LandingFeatures() {
  const features = [
    {
      title: "Simplified Property Management",
      desc: "Easily manage tenants, leases, and maintenance requests from one platform.",
    },
    {
      title: "Seamless Rent Payments",
      desc: "Track payments, send reminders, and accept multiple payment methods securely.",
    },
    {
      title: "Tenant Self-Service",
      desc: "Give tenants a dashboard to pay rent, submit maintenance tickets, and view history.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow">
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
