import { NextResponse } from "next/server";
import { getGoogleSheets, getSheets } from "@/lib/googleSheets";

const spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.SHEET_ID!;

export async function POST(req: Request) {
  try {
    const { payment_id, ref, status } = await req.json();
    const sheets = payment_id ? await getGoogleSheets() : await getSheets();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Payments!A2:Z",
    });

    const rows = res.data.values || [];
    let updated = false;

    if (payment_id) {
      const idx = rows.findIndex((r) => r[0] === payment_id);
      if (idx !== -1) {
        rows[idx][8] = "VERIFIED"; // Status column
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Payments!A${idx + 2}:Z${idx + 2}`,
          valueInputOption: "RAW",
          requestBody: { values: [rows[idx]] },
        });
        updated = true;
      }
    } else if (ref) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][6] === ref) {
          rows[i][7] = status || "VERIFIED";
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Payments!A${i + 2}:Z${i + 2}`,
            valueInputOption: "RAW",
            requestBody: { values: [rows[i]] },
          });
          updated = true;
          break;
        }
      }
    }

    if (!updated) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error verifying payment:", err);
    return NextResponse.json({ error: "Failed to verify" }, { status: 500 });
  }
}
