"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">
          Placeholder for settings like fees, payout schedules, system configs.
        </p>
      </CardContent>
    </Card>
  );
}
