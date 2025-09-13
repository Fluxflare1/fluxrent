// frontend/app/api/tenant/maintenance/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    openRequests: 2,
    closedRequests: 5,
    requests: [
      { id: 1, title: "Leaking faucet", status: "Open", date: "2025-09-05" },
      { id: 2, title: "Broken AC", status: "Open", date: "2025-09-10" },
      { id: 3, title: "Light bulb replacement", status: "Closed", date: "2025-08-22" },
    ],
    trend: [1, 2, 0, 3, 2], // weekly maintenance requests
  });
}
