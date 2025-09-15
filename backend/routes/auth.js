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

// Helper to generate random password
function generatePassword() {
  return crypto.randomBytes(4).toString("hex"); // 8-char random password
}

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    let status = "pending";
    let uid = "";
    let username = "";
    let password = "";

    // If tenant → auto approve immediately
    if (role.toLowerCase() === "tenant") {
      status = "approved";
      uid = uuidv4();
      username = email;
      password = generatePassword();

      // Send credentials via email
      await sendCredentialsEmail({
        to: email,
        name,
        username,
        password,
        role,
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:G",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[uid, name, email, phone, role, status, username]],
      },
    });

    res.json({
      success: true,
      message:
        role.toLowerCase() === "tenant"
          ? "Tenant auto-approved. Credentials emailed."
          : "Signup pending admin approval.",
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
