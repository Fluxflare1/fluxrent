import type { NextApiRequest, NextApiResponse } from "next";
import { getNotifications, logNotification } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const notifications = await getNotifications();
      return res.status(200).json(notifications);
    }

    if (req.method === "POST") {
      const result = await logNotification(req.body);
      return res.status(201).json({ ok: true, result });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("Notifications API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
