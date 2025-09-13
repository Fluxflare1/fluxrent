"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

const adminNavItems = [
  { label: "Overview", href: "/admin" },
  { label: "Properties", href: "/admin/properties" },
  { label: "Tenants", href: "/admin/tenants" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard" navItems={adminNavItems} sidebarColor="bg-indigo-700">
      <h1 className="text-2xl font-bold mb-6">Welcome, Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Total Properties</h3>
          <p className="text-2xl font-bold text-indigo-700">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Active Tenants</h3>
          <p className="text-2xl font-bold text-indigo-700">45</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
          <p className="text-2xl font-bold text-red-600">5</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
