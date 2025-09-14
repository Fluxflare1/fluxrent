// frontend/pages/api/payments/add.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { recordPayment } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const payment = await recordPayment(req.body);
    res.status(200).json({ success: true, payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
