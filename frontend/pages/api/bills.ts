import type { NextApiRequest, NextApiResponse } from "next";
import { getBills, addBill, getBillById, addBillPayment } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { id } = req.query;
      if (id) {
        const bill = await getBillById(id as string);
        return res.status(200).json(bill);
      }
      const bills = await getBills();
      return res.status(200).json(bills);
    }

    if (req.method === "POST") {
      const result = await addBill(req.body);
      return res.status(201).json({ ok: true, result });
    }

    if (req.method === "PUT") {
      const result = await addBillPayment(req.body);
      return res.status(200).json({ ok: true, result });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("Bills API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
