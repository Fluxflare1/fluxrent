"use client";

const plans = [
  {
    name: "Starter",
    price: "$29/mo",
    features: ["1 Property", "5 Tenants", "Basic Support"],
  },
  {
    name: "Professional",
    price: "$99/mo",
    features: ["10 Properties", "Unlimited Tenants", "Priority Support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Unlimited Properties", "Dedicated Manager", "24/7 Support"],
  },
];

export default function LandingPricing() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          Simple, Transparent Pricing
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="border rounded-xl p-8 shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-4">{plan.name}</h3>
              <p className="text-3xl font-bold mb-6">{plan.price}</p>
              <ul className="mb-6 space-y-2 text-gray-600">
                {plan.features.map((feature, i) => (
                  <li key={i}>✔ {feature}</li>
                ))}
              </ul>
              <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
