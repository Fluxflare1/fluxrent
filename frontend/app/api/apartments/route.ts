import { NextResponse } from "next/server";
import { getApartments, addApartment } from "@/lib/googleSheets";

export async function GET() {
  const data = await getApartments();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addApartment(body);
  return NextResponse.json(data);
}
