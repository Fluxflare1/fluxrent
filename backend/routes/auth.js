import express from "express";
import { google } from "googleapis";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const router = express.Router();

// Load service account key
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

const SPREADSHEET_ID = "1amy14SwIt0zv-IPWEE9x44sw6wqTydUtqxgdz_R8ihk";

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;

    // Default pending status
    let status = "pending";
    let uid = "";

    // If role is tenant → auto approve
    if (role.toLowerCase() === "tenant") {
      status = "approved";
      uid = uuidv4();
      // You’d also trigger email here with login credentials
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[uid, name, email, phone, role, status]],
      },
    });

    res.json({
      success: true,
      message:
        role.toLowerCase() === "tenant"
          ? "Tenant auto-approved. Credentials sent."
          : "Signup pending admin approval.",
      uid: uid || null,
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
