import { NextResponse } from "next/server";
import { googleSheets } from "@/lib/googleSheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function POST(req: Request) {
  try {
    const { prepayment_id } = await req.json();
    const sheets = await googleSheets();

    // Fetch Prepayment row
    const preRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Prepayments!A:H",
    });
    const preRows = preRes.data.values || [];
    const header = preRows[0];
    const idx = preRows.findIndex((r) => r[0] === prepayment_id);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Prepayment not found" },
        { status: 404 }
      );
    }

    let prepayment = {
      id: preRows[idx][0],
      tenant_id: preRows[idx][1],
      tenant_name: preRows[idx][2],
      apartment_id: preRows[idx][3],
      amount: parseFloat(preRows[idx][4]),
      remaining: parseFloat(preRows[idx][5]),
    };

    if (prepayment.remaining <= 0) {
      return NextResponse.json(
        { error: "No remaining balance" },
        { status: 400 }
      );
    }

    // Fetch Bills
    const billsRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Bills!A:P",
    });
    const billRows = billsRes.data.values || [];
    let bills = billRows.slice(1).map((r, i) => ({
      id: r[0],
      apartment_id: r[1],
      bill_type: r[2],
      period: r[3],
      due_date: r[5],
      amount: parseFloat(r[6] || "0"),
      balance: parseFloat(r[7] || "0"),
      status: r[8],
      rowIndex: i + 2,
    }));

    // Filter due & unpaid bills for the apartment
    bills = bills.filter(
      (b) =>
        b.apartment_id === prepayment.apartment_id &&
        (b.status === "due" || b.status === "partial") &&
        b.balance > 0
    );
    bills.sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );

    let allocations: any[] = [];
    let remaining = prepayment.remaining;

    for (const bill of bills) {
      if (remaining <= 0) break;

      const applied = Math.min(remaining, bill.balance);
      remaining -= applied;
      const newBalance = bill.balance - applied;
      const newStatus = newBalance === 0 ? "paid" : "partial";

      // Update bill balance/status
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Bills!H${bill.rowIndex}:I${bill.rowIndex}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [[newBalance, newStatus]] },
      });

      // Append to BillPayments
      const payRow = [
        `BILLPAY-${Date.now()}`,
        bill.id,
        `PREPAY-${prepayment.id}`,
        prepayment.tenant_id,
        prepayment.tenant_name,
        applied,
        "prepayment",
        "yes",
        "",
        new Date().toISOString(),
        "Auto allocation from prepayment",
      ];
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "BillPayments!A:K",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [payRow] },
      });

      allocations.push({ bill_id: bill.id, applied, newBalance, newStatus });
    }

    // Update Prepayment remaining balance
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Prepayments!F${idx + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [[remaining]] },
    });

    return NextResponse.json({
      success: true,
      prepayment_id: prepayment.id,
      allocations,
      remaining,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
