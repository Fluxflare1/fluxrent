"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  const revenueData = stats.revenueTrend.map((val: number, idx: number) => ({
    month: `M${idx + 1}`,
    revenue: val,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <Card><CardContent><p className="text-lg">Tenants</p><p className="text-2xl font-bold">{stats.totalTenants}</p></CardContent></Card>
        <Card><CardContent><p className="text-lg">Properties</p><p className="text-2xl font-bold">{stats.totalProperties}</p></CardContent></Card>
        <Card><CardContent><p className="text-lg">Revenue</p><p className="text-2xl font-bold">${stats.monthlyRevenue}</p></CardContent></Card>
        <Card><CardContent><p className="text-lg">Overdue</p><p className="text-2xl font-bold">{stats.overduePayments}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="font-semibold mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#4a6fa5" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}



"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/health/")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded shadow">
          <h2 className="font-semibold">Total Users</h2>
          <p>{stats.users}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="font-semibold">Active Users</h2>
          <p>{stats.active_users}</p>
        </div>
        <div className="p-4 border rounded shadow">
          <h2 className="font-semibold">Roles</h2>
          <ul>
            {Object.entries(stats.roles).map(([role, count]) => (
              <li key={role}>
                {role}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
