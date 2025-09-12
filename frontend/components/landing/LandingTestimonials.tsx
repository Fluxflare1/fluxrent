// frontend/components/landing/LandingTestimonials.tsx
export default function LandingTestimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-semibold mb-8">Trusted by teams and tenants</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <blockquote className="p-6 bg-slate-50 rounded-lg">
            <p className="text-slate-700 mb-3">
              "FluxRent reduced our admin overhead significantly — rent collection and tenant follow-ups are so much simpler."
            </p>
            <strong>— Chinyere O., Property Manager</strong>
          </blockquote>

          <blockquote className="p-6 bg-slate-50 rounded-lg">
            <p className="text-slate-700 mb-3">
              "As a tenant, paying rent and filing maintenance requests is effortless. The receipts are handy for records too."
            </p>
            <strong>— David K., Tenant</strong>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
