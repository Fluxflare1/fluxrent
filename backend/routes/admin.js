import express from "express";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { sendCredentialsEmail } from "../utils/email.js";

const router = express.Router();

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1amy14SwIt0zv-IPWEE9x44sw6wqTydUtqxgdz_R8ihk";

function generatePassword() {
  return crypto.randomBytes(4).toString("hex");
}

router.post("/approve-user", async (req, res) => {
  try {
    const { email } = req.body;
    const uid = uuidv4();
    const password = generatePassword();

    // Fetch rows
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:G",
    });

    const rows = result.data.values || [];
    const header = rows[0];
    const emailIndex = header.indexOf("Email");
    const nameIndex = header.indexOf("Name");
    const roleIndex = header.indexOf("Role");

    let rowToUpdate = -1;
    let userRow = null;

    rows.forEach((row, idx) => {
      if (row[emailIndex] === email && rowToUpdate === -1) {
        rowToUpdate = idx;
        userRow = row;
      }
    });

    if (rowToUpdate === -1) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const name = userRow[nameIndex];
    const role = userRow[roleIndex];
    const username = email;

    // Update sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowToUpdate + 1}:G${rowToUpdate + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[uid, name, email, userRow[3], role, "approved", username]],
      },
    });

    // Send credentials via email
    await sendCredentialsEmail({
      to: email,
      name,
      username,
      password,
      role,
    });

    res.json({ success: true, message: "User approved. Credentials emailed." });
  } catch (err) {
    console.error("❌ Approval error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
