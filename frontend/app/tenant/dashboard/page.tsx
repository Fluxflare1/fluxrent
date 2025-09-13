"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

const navItems = [
  { label: "Dashboard", href: "/tenant/dashboard" },
  { label: "Payments", href: "/tenant/payments" },
  { label: "Maintenance", href: "/tenant/maintenance" },
  { label: "Settings", href: "/tenant/settings" },
];

export default function TenantDashboard() {
  return (
    <DashboardLayout title="Tenant Portal" navItems={navItems}>
      {/* Payments Table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Method</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2">2025-09-01</td>
                <td className="px-4 py-2">$1,200</td>
                <td className="px-4 py-2 text-green-600">Paid</td>
                <td className="px-4 py-2">Credit Card</td>
              </tr>
              <tr className="border-t">
                <td className="px-4 py-2">2025-08-01</td>
                <td className="px-4 py-2">$1,200</td>
                <td className="px-4 py-2 text-green-600">Paid</td>
                <td className="px-4 py-2">Bank Transfer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Maintenance Form */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Submit Maintenance Request</h2>
        <form className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Leaky faucet in kitchen"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Details</label>
            <textarea
              rows={4}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Please fix the faucet, water is dripping continuously."
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Submit Request
          </button>
        </form>
      </section>
    </DashboardLayout>
  );
}
