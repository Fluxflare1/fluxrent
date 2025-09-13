"use client";

export default function LandingSponsors() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-xl font-semibold text-gray-600 mb-8">
          Trusted by landlords and property managers nationwide
        </h2>
        <div className="flex flex-wrap justify-center gap-8 opacity-70">
          <img src="/logos/logo1.svg" alt="Logo 1" className="h-10" />
          <img src="/logos/logo2.svg" alt="Logo 2" className="h-10" />
          <img src="/logos/logo3.svg" alt="Logo 3" className="h-10" />
          <img src="/logos/logo4.svg" alt="Logo 4" className="h-10" />
        </div>
      </div>
    </section>
  );
}
