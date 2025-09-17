"use client";

import DashboardLayout from "@/components/layout/DashboardLayout"; // Fixed import path
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
      <section className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={paymentHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, "Amount Paid"]} />
            <Bar dataKey="paid" fill="#4a6fa5" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Balance</h3>
          <p className="text-2xl font-bold text-green-600">$0.00</p>
          <p className="text-xs text-gray-400 mt-1">All payments are current</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Next Payment Due</h3>
          <p className="text-2xl font-bold text-gray-800">June 1, 2024</p>
          <p className="text-xs text-gray-400 mt-1">$1,200.00</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Maintenance Requests</h3>
          <p className="text-2xl font-bold text-blue-600">0</p>
          <p className="text-xs text-gray-400 mt-1">No active requests</p>
        </div>
      </div>

      {/* Recent Activity */}
      <section className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Payment Received</p>
              <p className="text-sm text-gray-500">May 1, 2024 - $1,200.00</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Payment Received</p>
              <p className="text-sm text-gray-500">April 1, 2024 - $1,200.00</p>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">Lease Renewal Notice</p>
              <p className="text-sm text-gray-500">March 15, 2024</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Notice</span>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
