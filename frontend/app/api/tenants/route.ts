import { NextResponse } from "next/server";
import { getTenants } from "@/lib/googleSheets";

export async function GET() {
  const data = await getTenants();
  return NextResponse.json(data);
}
