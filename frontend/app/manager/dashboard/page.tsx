"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function ManagerDashboard() {
  const navItems = [
    { label: "Dashboard", href: "/manager/dashboard" },
    { label: "My Properties", href: "/manager/properties" },
    { label: "Tenants", href: "/manager/tenants" },
    { label: "Bills", href: "/manager/bills" },
    { label: "Payments", href: "/manager/payments" },
    { label: "Support", href: "/manager/support" },
  ];

  return (
    <DashboardLayout title="Manager Panel" navItems={navItems} sidebarColor="bg-purple-700">
      <h1 className="text-3xl font-bold mb-6">Property Manager Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Assigned Properties</h2>
          <p className="text-2xl font-bold">6</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Pending Bills</h2>
          <p className="text-2xl font-bold text-red-500">$1,200</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
