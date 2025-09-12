"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function AdminDashboard() {
  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Properties", href: "/admin/properties" },
    { label: "Tenants", href: "/admin/tenants" },
    { label: "Billing", href: "/admin/bills" },
    { label: "Reports", href: "/admin/reports" },
    { label: "Settings", href: "/admin/settings" },
  ];

  return (
    <DashboardLayout title="Admin Panel" navItems={navItems} sidebarColor="bg-indigo-700">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Total Properties</h2>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Active Tenants</h2>
          <p className="text-2xl font-bold">48</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-gray-500 text-sm">Monthly Revenue</h2>
          <p className="text-2xl font-bold text-green-600">$12,500</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
