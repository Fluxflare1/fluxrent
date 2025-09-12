export default function LandingTestimonials() {
  return (
    <section className="px-8 py-20 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-10">What Our Clients Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            “Whitepace has transformed the way our team collaborates. The intuitive
            UI and features save us hours every week.”
          </p>
          <h3 className="font-bold">— Sarah J., Property Manager</h3>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            “An all-in-one platform that keeps property owners and tenants on the same page.
            Couldn’t recommend it more.”
          </p>
          <h3 className="font-bold">— Daniel R., Tenant</h3>
        </div>
      </div>
    </section>
  );
}
