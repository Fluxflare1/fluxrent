import { NextResponse } from "next/server";
import { getProperties, addProperty } from "@/lib/googleSheets";

export async function GET() {
  const data = await getProperties();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addProperty(body);
  return NextResponse.json(data);
}
