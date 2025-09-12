import type { NextApiRequest, NextApiResponse } from "next";
import { getPayments, recordPayment, addReceiptLinkToPayment } from "@/lib/googleSheets";

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

    if (req.method === "PUT") {
      const { ref, link } = req.body;
      if (!ref || !link) return res.status(400).json({ error: "Missing ref or link" });
      const result = await addReceiptLinkToPayment(ref, link);
      return res.status(200).json(result);
    }

    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("Payments API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
