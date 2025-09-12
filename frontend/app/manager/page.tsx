"use client";

import Link from "next/link";

export default function ManagerDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-purple-700 text-white flex flex-col">
        <div className="px-6 py-6 text-2xl font-bold border-b border-purple-600">
          Manager Panel
        </div>
        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link href="/manager" className="block hover:text-purple-200">
            Dashboard
          </Link>
          <Link href="/manager/properties" className="block hover:text-purple-200">
            My Properties
          </Link>
          <Link href="/manager/tenants" className="block hover:text-purple-200">
            Tenants
          </Link>
          <Link href="/manager/bills" className="block hover:text-purple-200">
            Bills
          </Link>
          <Link href="/manager/reports" className="block hover:text-purple-200">
            Reports
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Property Manager Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">My Properties</h2>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Total Tenants</h2>
            <p className="text-2xl font-bold">87</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Revenue This Month</h2>
            <p className="text-2xl font-bold">$18,560</p>
          </div>
        </div>

        {/* Properties List */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">My Properties</h2>
          <ul className="divide-y">
            <li className="py-2 flex justify-between">
              <span>Sunset Apartments</span>
              <span className="text-gray-500">12 Tenants</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Greenwood Villas</span>
              <span className="text-gray-500">8 Tenants</span>
            </li>
            <li className="py-2 flex justify-between">
              <span>Oakwood Residences</span>
              <span className="text-gray-500">15 Tenants</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
