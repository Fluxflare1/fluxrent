import { NextResponse } from "next/server";
import { getUtilities, addUtility } from "@/lib/googleSheets";

export async function GET() {
  const data = await getUtilities();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addUtility(body);
  return NextResponse.json(data);
}
