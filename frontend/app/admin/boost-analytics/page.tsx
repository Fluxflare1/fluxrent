"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ENDPOINTS, authApi } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

interface BoostAnalytics {
  period_start: string;
  total_revenue: number;
  top_properties: {
    property_id: number;
    title: string;
    boost_count: number;
    revenue: number;
  }[];
}

export default function BoostAnalyticsPage() {
  const [data, setData] = useState<BoostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .get(ENDPOINTS.admin.boostAnalytics, { params: { period: "30d" } })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Failed to load boost analytics:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4">Loading boost analytics...</div>;
  }

  if (!data) {
    return <div className="p-4 text-red-500">Failed to load data</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Boost Revenue (last 30 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            ₦{data.total_revenue.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Boosted Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.top_properties}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue (₦)" />
              <Bar dataKey="boost_count" fill="#3b82f6" name="Boost Count" />
            </BarChart>
          </ResponsiveContainer>
          <ul className="mt-4 space-y-2">
            {data.top_properties.map((prop) => (
              <li
                key={prop.property_id}
                className="flex justify-between border-b pb-1"
              >
                <span>{prop.title}</span>
                <span>
                  ₦{prop.revenue.toLocaleString()} ({prop.boost_count} boosts)
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
