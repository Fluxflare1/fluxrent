"use client";

import Link from "next/link";

export default function LandingHero() {
  return (
    <section className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Smarter Tenant & Property Management
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          A modern SaaS solution for landlords, property managers, and tenants — 
          streamline rent collection, maintenance requests, and communication.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/auth/register"
            className="bg-white text-indigo-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="border border-white font-semibold px-6 py-3 rounded-lg hover:bg-white hover:text-indigo-600"
          >
            Learn More
          </Link>
        </div>
      </div>
    </section>
  );
}
