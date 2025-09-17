import { NextResponse } from "next/server";
import { getUsers, addUser } from "@/lib/googleSheets";

export async function GET() {
  const data = await getUsers();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const data = await addUser(body);
  return NextResponse.json(data);
}
