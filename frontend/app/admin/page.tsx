"use client";

import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="px-6 py-6 text-2xl font-bold border-b border-indigo-600">
          Admin Panel
        </div>
        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link href="/admin" className="block hover:text-indigo-200">
            Dashboard
          </Link>
          <Link href="/admin/users" className="block hover:text-indigo-200">
            Users
          </Link>
          <Link href="/admin/properties" className="block hover:text-indigo-200">
            Properties
          </Link>
          <Link href="/admin/payments" className="block hover:text-indigo-200">
            Payments
          </Link>
          <Link href="/admin/settings" className="block hover:text-indigo-200">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Total Properties</h2>
            <p className="text-2xl font-bold">245</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Active Tenants</h2>
            <p className="text-2xl font-bold">1,024</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Payments This Month</h2>
            <p className="text-2xl font-bold">$56,340</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Outstanding Bills</h2>
            <p className="text-2xl font-bold">$12,890</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Recent User Registrations</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600">
                <th className="pb-2">User</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">John Doe</td>
                <td>Tenant</td>
                <td>Sep 10, 2025</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Jane Smith</td>
                <td>Manager</td>
                <td>Sep 9, 2025</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Michael Lee</td>
                <td>Tenant</td>
                <td>Sep 8, 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
