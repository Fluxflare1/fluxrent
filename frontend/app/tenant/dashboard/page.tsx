"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function TenantDashboard() {
  const navItems = [
    { label: "Dashboard", href: "/tenant/dashboard" },
    { label: "My Bills", href: "/tenant/bills" },
    { label: "Payments", href: "/tenant/payments" },
    { label: "Receipts", href: "/tenant/receipts" },
    { label: "Support", href: "/tenant/support" },
  ];

  return (
    <DashboardLayout title="Tenant Panel" navItems={navItems} sidebarColor="bg-green-700">
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
    </DashboardLayout>
  );
}
