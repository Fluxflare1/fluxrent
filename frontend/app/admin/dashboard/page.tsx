"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from "recharts";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Properties", href: "/admin/properties" },
  { label: "Settings", href: "/admin/settings" },
];

const revenueData = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 74500 },
];

const tenantGrowthData = [
  { month: "Jan", tenants: 200 },
  { month: "Feb", tenants: 215 },
  { month: "Mar", tenants: 230 },
  { month: "Apr", tenants: 240 },
  { month: "May", tenants: 245 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Portal" navItems={navItems}>
      {/* Stats */}
      <section className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm text-gray-500">Total Tenants</h3>
          <p className="text-2xl font-bold mt-2">245</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm text-gray-500">Active Properties</h3>
          <p className="text-2xl font-bold mt-2">62</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm text-gray-500">Monthly Revenue</h3>
          <p className="text-2xl font-bold mt-2">$74,500</p>
        </div>
      </section>

      {/* Charts */}
      <section className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#4a6fa5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Tenant Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tenantGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tenants" fill="#166088" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </DashboardLayout>
  );
}
