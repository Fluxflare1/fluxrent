export default function LandingTestimonials() {
  return (
    <section className="px-8 py-20 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-10">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            “FluxRent makes it easy to track rent and manage multiple units.
            It’s reduced our admin work by 50%.”
          </p>
          <h3 className="font-bold">— Alex M., Property Manager</h3>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-600 mb-4">
            “I can pay rent and submit maintenance requests in seconds.
            Communication with my landlord has never been easier.”
          </p>
          <h3 className="font-bold">— Priya K., Tenant</h3>
        </div>
      </div>
    </section>
  );
}
