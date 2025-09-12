import type { NextApiRequest, NextApiResponse } from "next";
import { getApartments, addApartment, assignTenantToApartment } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const { propertyId } = req.query;
      const apartments = await getApartments(propertyId as string);
      return res.status(200).json(apartments);
    }

    if (req.method === "POST") {
      const result = await addApartment(req.body);
      return res.status(201).json({ ok: true, result });
    }

    if (req.method === "PUT") {
      const result = await assignTenantToApartment(req.body);
      return res.status(200).json({ ok: true, result });
    }

    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("Apartments API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
