// frontend/app/dashboard/owner/page.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchOwnerSummary, fetchRevenueBreakdown } from "@/lib/apiOwner";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    fetchOwnerSummary().then(setSummary);
    fetchRevenueBreakdown().then(setRevenue);
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card><CardContent><h2>Users</h2><p>{summary.users}</p></CardContent></Card>
      <Card><CardContent><h2>Properties</h2><p>{summary.properties}</p></CardContent></Card>
      <Card><CardContent><h2>Revenue</h2><p>₦{summary.revenue}</p></CardContent></Card>
      <div className="col-span-3">
        <h2 className="text-xl mb-2">Revenue Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenue}>
            <XAxis dataKey="type" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
