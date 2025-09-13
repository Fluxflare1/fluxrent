// frontend/app/api/manager/stats/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    assignedProperties: 12,
    tenantsManaged: 58,
    openTickets: 7,
    resolvedTickets: 42,
    maintenanceRequestsTrend: [3, 5, 2, 6, 7], // weekly requests
  });
}
