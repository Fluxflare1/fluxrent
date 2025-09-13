"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";

const managerNavItems = [
  { label: "Overview", href: "/manager" },
  { label: "Assigned Properties", href: "/manager/properties" },
  { label: "Tenants", href: "/manager/tenants" },
  { label: "Maintenance", href: "/manager/maintenance" },
  { label: "Settings", href: "/manager/settings" },
];

export default function ManagerDashboard() {
  return (
    <DashboardLayout title="Manager Dashboard" navItems={managerNavItems} sidebarColor="bg-green-700">
      <h1 className="text-2xl font-bold mb-6">Welcome, Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Managed Properties</h3>
          <p className="text-2xl font-bold text-green-700">6</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Tenants Under Care</h3>
          <p className="text-2xl font-bold text-green-700">22</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Open Tickets</h3>
          <p className="text-2xl font-bold text-yellow-600">3</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
