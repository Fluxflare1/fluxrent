import { NextResponse } from "next/server";
import { getTemplates, addTemplate } from "@/lib/googleSheets";

export async function GET() {
  const data = await getTemplates();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addTemplate(body);
  return NextResponse.json(data);
}
