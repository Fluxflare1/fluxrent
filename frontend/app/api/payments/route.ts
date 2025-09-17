import { NextResponse } from "next/server";
import { getPayments, recordPayment } from "@/lib/googleSheets";

export async function GET() {
  const data = await getPayments();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await recordPayment(body);
  return NextResponse.json(data);
}
