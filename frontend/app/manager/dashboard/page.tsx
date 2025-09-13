"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend
} from "recharts";

const navItems = [
  { label: "Dashboard", href: "/manager/dashboard" },
  { label: "Properties", href: "/manager/properties" },
  { label: "Tenants", href: "/manager/tenants" },
  { label: "Maintenance", href: "/manager/maintenance" },
  { label: "Settings", href: "/manager/settings" },
];

const occupancyData = [
  { name: "Occupied", value: 85 },
  { name: "Vacant", value: 15 },
];

const maintenanceData = [
  { month: "Jan", requests: 12 },
  { month: "Feb", requests: 18 },
  { month: "Mar", requests: 10 },
  { month: "Apr", requests: 22 },
  { month: "May", requests: 14 },
];

const COLORS = ["#4a6fa5", "#e5e7eb"];

export default function ManagerDashboard() {
  return (
    <DashboardLayout title="Manager Portal" navItems={navItems}>
      {/* Stats */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm text-gray-500">Managed Properties</h3>
          <p className="text-2xl font-bold mt-2">8</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm text-gray-500">Active Tenants</h3>
          <p className="text-2xl font-bold mt-2">96</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm text-gray-500">Open Requests</h3>
          <p className="text-2xl font-bold mt-2">14</p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Occupancy Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={occupancyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {occupancyData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Maintenance Requests</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#166088" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </DashboardLayout>
  );
}
