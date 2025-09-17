import { NextResponse } from "next/server";
import { getNotifications, logNotification } from "@/lib/googleSheets";

export async function GET() {
  const data = await getNotifications();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await logNotification(body);
  return NextResponse.json(data);
}
