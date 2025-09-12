import type { NextApiRequest, NextApiResponse } from "next";
import { getTenants, addTenant, updateTenantKyc } from "@/lib/googleSheets";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      const tenants = await getTenants();
      return res.status(200).json(tenants);
    }

    if (req.method === "POST") {
      const result = await addTenant(req.body);
      return res.status(201).json({ ok: true, result });
    }

    if (req.method === "PUT") {
      const { tenantId, kycLink } = req.body;
      if (!tenantId || !kycLink) return res.status(400).json({ error: "Missing tenantId or kycLink" });
      const result = await updateTenantKyc(tenantId, kycLink);
      return res.status(200).json(result);
    }

    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err: any) {
    console.error("Tenants API error:", err);
    return res.status(500).json({ error: err.message });
  }
}
