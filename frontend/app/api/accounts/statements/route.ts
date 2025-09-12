// frontend/app/api/accounts/statements/route.ts
import { NextResponse } from "next/server";
import { googleSheets } from "@/lib/googleSheets";
import { googleDrive } from "@/services/google/drive.service";
import PDFDocument from "pdfkit";
import stream from "stream";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function POST(req: Request) {
  try {
    const { tenant_id } = await req.json();
    const sheets = googleSheets; // ✅ fixed: no need to call as a function

    // Fetch ledger
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Ledger!A:F",
    });
    const rows = res.data.values || [];
    const ledger = rows
      .slice(1)
      .filter((r) => r[1] === "tenant" && r[2] === tenant_id)
      .map((r) => ({
        id: r[0],
        debit: parseFloat(r[3] || "0"),
        credit: parseFloat(r[4] || "0"),
        date: r[5],
      }));

    // Generate PDF
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    const passThrough = new stream.PassThrough();
    doc.pipe(passThrough);
    passThrough.on("data", (chunk) => chunks.push(chunk));

    doc.fontSize(18).text("Statement of Account", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tenant ID: ${tenant_id}`);
    doc.moveDown();

    ledger.forEach((entry) => {
      doc.text(
        `${entry.date} | DR: ${entry.debit} | CR: ${entry.credit} | TXN: ${entry.id}`
      );
    });

    const balance =
      ledger.reduce((a, c) => a + c.credit - c.debit, 0) || 0;
    doc.moveDown().text(`Closing Balance: ${balance}`, { align: "right" });

    doc.end();

    await new Promise((resolve) => {
      passThrough.on("end", resolve);
      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);

    // Upload to Drive
    const drive = googleDrive; // ✅ fixed: not callable
    const file = await drive.files.create({
      requestBody: {
        name: `Statement-${tenant_id}-${Date.now()}.pdf`,
        parents: [process.env.DRIVE_STATEMENTS_FOLDER!],
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: stream.Readable.from(pdfBuffer),
      },
      fields: "id, webViewLink",
    });

    return NextResponse.json({
      success: true,
      link: file.data.webViewLink,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
