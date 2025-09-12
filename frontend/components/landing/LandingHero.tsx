import Image from "next/image";

export default function LandingHero() {
  return (
    <section className="bg-blue-900 text-white px-8 py-20 text-center relative">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Simplify Property & Tenant Management
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-8">
          FluxRent helps property managers and tenants stay connected.
          Track leases, manage payments, streamline communication, and handle maintenance requests — all in one platform.
        </p>
        <div className="flex justify-center space-x-4">
          <a
            href="#features"
            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300"
          >
            Explore Features
          </a>
          <a
            href="/login"
            className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-900"
          >
            Login
          </a>
        </div>
      </div>

      {/* Illustration */}
      <div className="mt-12 flex justify-center">
        <Image
          src="/illustrations/property-team.svg"
          alt="Property Management Illustration"
          width={500}
          height={350}
        />
      </div>
    </section>
  );
}
