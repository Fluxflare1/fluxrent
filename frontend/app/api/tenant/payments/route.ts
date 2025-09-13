// frontend/app/api/tenant/payments/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalDue: 1200,
    upcomingPayment: "2025-10-01",
    payments: [
      { id: 1, month: "June", amount: 1200, status: "Paid" },
      { id: 2, month: "July", amount: 1200, status: "Paid" },
      { id: 3, month: "August", amount: 1200, status: "Overdue" },
    ],
  });
}
