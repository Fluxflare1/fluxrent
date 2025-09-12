import type { NextApiRequest, NextApiResponse } from "next";
import { getRentSchedules, markRentPaid } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const schedules = await getRentSchedules();
      return res.status(200).json(schedules);
    }

    if (req.method === "PUT") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "Missing schedule ID" });
      const result = await markRentPaid(id);
      return res.status(200).json(result);
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("RentSchedules API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
