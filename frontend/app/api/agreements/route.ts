import { NextResponse } from "next/server";
import { getAgreements, addAgreement } from "@/lib/googleSheets";

export async function GET() {
  const data = await getAgreements();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addAgreement(body);
  return NextResponse.json(data);
}
