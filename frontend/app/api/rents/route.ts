import { NextResponse } from "next/server";
import { getRentSchedules, markRentPaid } from "@/lib/googleSheets";

export async function GET() {
  const data = await getRentSchedules();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const { id } = await req.json();
  const data = await markRentPaid(id);
  return NextResponse.json(data);
}
