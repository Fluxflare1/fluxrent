// frontend/pages/api/payments.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getPayments, recordPayment } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const payments = await getPayments();
      return res.status(200).json(payments);
    }

    if (req.method === "POST") {
      const result = await recordPayment(req.body);
      return res.status(201).json({ ok: true, result });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
