"use client";

import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const navItems = [
  { label: "Dashboard", href: "/tenant/dashboard" },
  { label: "Payments", href: "/tenant/payments" },
  { label: "Maintenance", href: "/tenant/maintenance" },
  { label: "Settings", href: "/tenant/settings" },
];

const paymentHistory = [
  { month: "Jan", paid: 1200 },
  { month: "Feb", paid: 1200 },
  { month: "Mar", paid: 1200 },
  { month: "Apr", paid: 1200 },
  { month: "May", paid: 1200 },
];

export default function TenantDashboard() {
  return (
    <DashboardLayout title="Tenant Portal" navItems={navItems}>
      {/* Payments Overview */}
      <section className="bg-white shadow rounded-lg p-6 mb-12">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={paymentHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="paid" fill="#4a6fa5" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </DashboardLayout>
  );
}
