"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerDashboardPage() {
  return (
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
  );
}
