"use client";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Tenant",
    feedback: "Paying rent and submitting requests is so simple now. I love it!",
  },
  {
    name: "David Lee",
    role: "Property Manager",
    feedback: "Managing multiple properties and tenants has never been easier.",
  },
  {
    name: "Emily Carter",
    role: "Landlord",
    feedback: "I finally have visibility into rent collection and tenant issues.",
  },
];

export default function LandingTestimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          What Our Users Are Saying
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <p className="text-gray-600 italic mb-4">“{t.feedback}”</p>
              <h3 className="font-semibold">{t.name}</h3>
              <span className="text-sm text-gray-500">{t.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
