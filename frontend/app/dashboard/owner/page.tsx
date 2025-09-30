"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const revenueData = [
  { month: "May", revenue: 320000 },
  { month: "Jun", revenue: 450000 },
  { month: "Jul", revenue: 380000 },
  { month: "Aug", revenue: 600000 },
  { month: "Sep", revenue: 720000 },
  { month: "Oct", revenue: 1240000 },
];

const userGrowthData = [
  { month: "May", users: 120 },
  { month: "Jun", users: 180 },
  { month: "Jul", users: 250 },
  { month: "Aug", users: 300 },
  { month: "Sep", users: 450 },
  { month: "Oct", users: 520 },
];

const topBoostedProperties = [
  { property: "Lekki Phase 1 Apt", revenue: 450000 },
  { property: "Abuja Duplex", revenue: 300000 },
  { property: "Ikeja Bungalow", revenue: 220000 },
  { property: "Victoria Island Loft", revenue: 180000 },
];

export default function OwnerDashboardPage() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,245</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Boost Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₦1,240,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Boosts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">37</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Boosted Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Top Boosted Properties</CardTitle>
        </CardHeader>
        <CardContent className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topBoostedProperties}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₦${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="revenue" fill="#f97316" barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
