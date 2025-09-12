"use client";

import Link from "next/link";

export default function TenantDashboard() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-green-700 text-white flex flex-col">
        <div className="px-6 py-6 text-2xl font-bold border-b border-green-600">
          Tenant Panel
        </div>
        <nav className="flex-1 px-4 py-6 space-y-4">
          <Link href="/tenant" className="block hover:text-green-200">
            Dashboard
          </Link>
          <Link href="/tenant/bills" className="block hover:text-green-200">
            My Bills
          </Link>
          <Link href="/tenant/payments" className="block hover:text-green-200">
            Payments
          </Link>
          <Link href="/tenant/receipts" className="block hover:text-green-200">
            Receipts
          </Link>
          <Link href="/tenant/support" className="block hover:text-green-200">
            Support
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Tenant Dashboard</h1>

        {/* Bills Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Outstanding Bills</h2>
            <p className="text-2xl font-bold text-red-500">$450</p>
          </div>
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-gray-500 text-sm">Last Payment</h2>
            <p className="text-2xl font-bold">$150</p>
            <p className="text-gray-500 text-sm">on Sep 10, 2025</p>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Payment History</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-600">
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">Sep 10, 2025</td>
                <td>$150</td>
                <td className="text-green-600">Paid</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Aug 10, 2025</td>
                <td>$150</td>
                <td className="text-green-600">Paid</td>
              </tr>
              <tr className="border-t">
                <td className="py-2">Jul 10, 2025</td>
                <td>$150</td>
                <td className="text-green-600">Paid</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
