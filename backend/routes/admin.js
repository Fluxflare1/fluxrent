import express from "express";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1amy14SwIt0zv-IPWEE9x44sw6wqTydUtqxgdz_R8ihk";

router.post("/approve-user", async (req, res) => {
  try {
    const { email } = req.body; // Identify user by email
    const uid = uuidv4();

    // Fetch rows
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:F",
    });

    const rows = result.data.values || [];
    const header = rows[0];
    const emailIndex = header.indexOf("Email");
    const statusIndex = header.indexOf("Status");
    const uidIndex = header.indexOf("UID");

    let rowToUpdate = -1;
    rows.forEach((row, idx) => {
      if (row[emailIndex] === email && rowToUpdate === -1) {
        rowToUpdate = idx;
      }
    });

    if (rowToUpdate === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowToUpdate + 1}:F${rowToUpdate + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[uid, rows[rowToUpdate][1], rows[rowToUpdate][2], rows[rowToUpdate][3], rows[rowToUpdate][4], "approved"]],
      },
    });

    res.json({ success: true, message: "User approved", uid });
  } catch (err) {
    console.error("❌ Approval error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
