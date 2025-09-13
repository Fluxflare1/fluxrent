// frontend/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalTenants: 128,
    totalProperties: 36,
    monthlyRevenue: 14800,
    overduePayments: 12,
    occupancyRate: 92,
    revenueTrend: [5000, 7500, 9800, 12000, 14800], // last 5 months
  });
}
