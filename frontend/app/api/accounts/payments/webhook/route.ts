import { NextResponse } from "next/server";
import { getGoogleSheets } from "@/lib/googleSheets";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const sig = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(raw)
      .digest("hex");

    if (sig !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(raw);
    if (event.event !== "charge.success") return NextResponse.json({ received: true });

    const { reference, amount, customer } = event.data;

    const sheets = await getGoogleSheets();

    const newPayment = [
      uuidv4(),
      "", // tenant_id (could be mapped via email/phone if stored)
      customer.email || "",
      "",
      "", // invoice_id to be mapped later
      amount / 100,
      "PAYSTACK",
      reference,
      "VERIFIED",
      new Date().toISOString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID!,
      range: "Payments!A:J",
      valueInputOption: "RAW",
      requestBody: { values: [newPayment] },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
