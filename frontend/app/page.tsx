"use client";

import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-6">
            Property & Tenant Management, Simplified
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Manage properties, tenants, billing, and payments in one seamless
            SaaS platform. Designed for landlords, managers, and tenants.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-3 border border-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Platform?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl shadow bg-gray-50">
              <h3 className="font-semibold mb-2">🏠 Property Management</h3>
              <p className="text-gray-600">
                Add, organize, and manage all your properties in one place.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow bg-gray-50">
              <h3 className="font-semibold mb-2">👤 Tenant Dashboard</h3>
              <p className="text-gray-600">
                Tenants can view agreements, bills, receipts, and make payments
                easily.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow bg-gray-50">
              <h3 className="font-semibold mb-2">💳 Secure Payments</h3>
              <p className="text-gray-600">
                Integrated with Paystack for safe and reliable transactions.
              </p>
            </div>
            <div className="p-6 rounded-xl shadow bg-gray-50">
              <h3 className="font-semibold mb-2">📊 Analytics</h3>
              <p className="text-gray-600">
                Get insights into rent collections, outstanding bills, and
                property performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">All-in-One Dashboard</h2>
          <p className="text-gray-600 mb-12">
            From property managers to tenants, everyone gets a tailored
            dashboard to manage what matters most.
          </p>
          <div className="rounded-2xl overflow-hidden shadow-xl border bg-white">
            <div className="w-full h-[400px] flex items-center justify-center text-gray-400">
              {/* Placeholder for screenshots */}
              <span>📸 Dashboard Preview Coming Soon</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Flexible Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border rounded-2xl p-8 shadow hover:shadow-lg transition">
              <h3 className="font-bold text-xl mb-4">Starter</h3>
              <p className="text-gray-600 mb-6">For small landlords</p>
              <p className="text-4xl font-extrabold mb-6">$0</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>✔ Manage up to 5 properties</li>
                <li>✔ Tenant dashboard</li>
                <li>✔ Email support</li>
              </ul>
              <Link
                href="/auth/signup"
                className="block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started
              </Link>
            </div>

            <div className="border rounded-2xl p-8 shadow-lg hover:shadow-xl transition bg-gray-50">
              <h3 className="font-bold text-xl mb-4">Pro</h3>
              <p className="text-gray-600 mb-6">For property managers</p>
              <p className="text-4xl font-extrabold mb-6">$29</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>✔ Unlimited properties</li>
                <li>✔ Online payments</li>
                <li>✔ Priority support</li>
              </ul>
              <Link
                href="/auth/signup"
                className="block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="border rounded-2xl p-8 shadow hover:shadow-lg transition">
              <h3 className="font-bold text-xl mb-4">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large organizations</p>
              <p className="text-4xl font-extrabold mb-6">Custom</p>
              <ul className="text-gray-600 mb-6 space-y-2">
                <li>✔ Advanced analytics</li>
                <li>✔ Custom integrations</li>
                <li>✔ Dedicated manager</li>
              </ul>
              <Link
                href="/contact"
                className="block px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} Tenant Management SaaS. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
