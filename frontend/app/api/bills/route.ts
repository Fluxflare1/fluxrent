import { NextResponse } from "next/server";
import { getBills, addBill } from "@/lib/googleSheets";

export async function GET() {
  const data = await getBills();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addBill(body);
  return NextResponse.json(data);
}
