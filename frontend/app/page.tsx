"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-indigo-700 text-white py-16 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Tenant Management SaaS</h1>
        <p className="text-lg mb-6">
          Simplify property & tenant management with a modern, all-in-one platform.
        </p>
        <div className="space-x-4">
          <Link
            href="/admin/dashboard"
            className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100"
          >
            Admin Login
          </Link>
          <Link
            href="/manager/dashboard"
            className="bg-indigo-500 px-6 py-3 rounded-lg font-semibold shadow hover:bg-indigo-600"
          >
            Manager Login
          </Link>
          <Link
            href="/tenant/dashboard"
            className="bg-green-500 px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-600"
          >
            Tenant Login
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">🏢 Property Management</h3>
          <p className="text-gray-600">
            Manage units, leases, and property details in one place.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">💳 Billing & Payments</h3>
          <p className="text-gray-600">
            Track bills, record payments, and generate receipts automatically.
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">👥 Tenant Portal</h3>
          <p className="text-gray-600">
            Give tenants easy access to bills, receipts, and support.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center py-6 text-gray-500">
        © {new Date().getFullYear()} Tenant Management SaaS. All rights reserved.
      </footer>
    </div>
  );
}
