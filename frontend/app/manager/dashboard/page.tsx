"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ManagerDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/manager/stats")
      .then((res) => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <p>Loading dashboard...</p>;

  const maintenanceData = stats.maintenanceRequestsTrend.map((val: number, idx: number) => ({
    week: `W${idx + 1}`,
    requests: val,
  }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Manager Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <Card><CardContent><p className="text-lg">Properties</p><p className="text-2xl font-bold">{stats.assignedProperties}</p></CardContent></Card>
        <Card><CardContent><p className="text-lg">Tenants</p><p className="text-2xl font-bold">{stats.tenantsManaged}</p></CardContent></Card>
        <Card><CardContent><p className="text-lg">Open Tickets</p><p className="text-2xl font-bold">{stats.openTickets}</p></CardContent></Card>
        <Card><CardContent><p className="text-lg">Resolved</p><p className="text-2xl font-bold">{stats.resolvedTickets}</p></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <h2 className="font-semibold mb-4">Maintenance Requests (Weekly)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={maintenanceData}>
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="requests" stroke="#166088" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
