import { NextResponse } from "next/server";
import { getGoogleSheets } from "@/lib/googleSheets";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sheets = await getGoogleSheets();

    // Load prepayments
    const prepaymentsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID!,
      range: "Prepayments!A2:H",
    });

    const rows = prepaymentsRes.data.values || [];
    const idx = rows.findIndex((r) => r[0] === params.id);
    if (idx === -1) return NextResponse.json({ error: "Prepayment not found" }, { status: 404 });

    const prepayment = rows[idx];
    let balance = parseFloat(prepayment[6] || "0");
    if (balance <= 0) return NextResponse.json({ message: "No balance to allocate" });

    // Load invoices
    const invoicesRes = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_ID!,
      range: "Invoices!A2:H",
    });
    const invoices = invoicesRes.data.values || [];

    for (let i = 0; i < invoices.length; i++) {
      let inv = invoices[i];
      if (inv[2] === prepayment[1] && inv[6] !== "PAID") {
        const due = parseFloat(inv[4] || "0") - parseFloat(inv[5] || "0");
        if (due <= 0) continue;

        const applied = Math.min(balance, due);
        balance -= applied;

        inv[5] = (parseFloat(inv[5] || "0") + applied).toString();
        if (parseFloat(inv[5]) >= parseFloat(inv[4])) {
          inv[6] = "PAID";
        } else {
          inv[6] = "PARTIAL";
        }

        // Update invoice row
        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.SHEET_ID!,
          range: `Invoices!A${i + 2}:H${i + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [inv] },
        });

        if (balance <= 0) break;
      }
    }

    // Update prepayment balance
    prepayment[5] = (parseFloat(prepayment[5] || "0") + (parseFloat(prepayment[6] || "0") - balance)).toString();
    prepayment[6] = balance.toString();
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.SHEET_ID!,
      range: `Prepayments!A${idx + 2}:H${idx + 2}`,
      valueInputOption: "RAW",
      requestBody: { values: [prepayment] },
    });

    return NextResponse.json({ success: true, remaining: balance });
  } catch (err) {
    console.error("Error allocating prepayment:", err);
    return NextResponse.json({ error: "Failed to allocate" }, { status: 500 });
  }
}




