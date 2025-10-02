// frontend/app/dashboard/owner/page.tsx
"use client";

import React, { useMemo } from "react";
import { useRevenueStats, useUserGrowth, useTopBoosts } from "@/lib/hooks/useOwnerStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Bar,
  Legend,
} from "recharts";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // adjust import if your UI exports are different
import { Loader } from "@/components/ui"; // small loader component or replace with your spinner

const ngn = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

function monthLabel(isoMonth: string) {
  // isoMonth e.g. "2025-10" -> "Oct 2025"
  try {
    const parsed = new Date(isoMonth + "-01");
    return format(parsed, "MMM yyyy");
  } catch {
    return isoMonth;
  }
}

export default function OwnerDashboardPage() {
  // Optionally allow query params for date ranges; here we fetch last 6 months by default.
  const revenueQ = useRevenueStats();
  const usersQ = useUserGrowth();
  const topQ = useTopBoosts({ limit: 6 });

  const revenueData = revenueQ.data ?? [];
  const usersData = usersQ.data ?? [];
  const topData = topQ.data ?? [];

  const formattedRevenue = useMemo(
    () =>
      revenueData.map((d) => ({
        month: monthLabel(d.month),
        value: d.value,
        rawMonth: d.month,
      })),
    [revenueData]
  );

  const formattedUsers = useMemo(
    () =>
      usersData.map((d) => ({
        month: monthLabel(d.month),
        value: d.value,
        rawMonth: d.month,
      })),
    [usersData]
  );

  const formattedTop = useMemo(
    () =>
      topData.map((t) => ({
        name: t.title || `#${t.property_id}`,
        revenue: t.revenue,
      })),
    [topData]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend (last months)</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueQ.isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => ngn.format ? ngn.format(v) : v} />
                    <Tooltip formatter={(v: number) => ngn.format ? ngn.format(v) : v} />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Growth (new signups)</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQ.isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader />
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Boosted Properties (by revenue)</CardTitle>
        </CardHeader>
        <CardContent>
          {topQ.isLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedTop} layout="vertical" margin={{ left: 40, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(v) => ngn.format ? ngn.format(v) : v} />
                  <YAxis dataKey="name" type="category" width={220} />
                  <Tooltip formatter={(v: number) => ngn.format ? ngn.format(v) : v} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
