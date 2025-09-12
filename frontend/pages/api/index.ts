import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000/api";

  const routes = [
    { path: "/tenants", methods: ["GET", "POST", "PUT"], description: "Manage tenants (list, create, update KYC)" },
    { path: "/payments", methods: ["GET", "POST"], description: "Record and view payments, add receipts" },
    { path: "/properties", methods: ["GET", "POST"], description: "Manage properties" },
    { path: "/apartments", methods: ["GET", "POST", "PUT"], description: "Manage apartments, assign tenants" },
    { path: "/utilities", methods: ["GET", "POST"], description: "Manage utilities" },
    { path: "/bills", methods: ["GET", "POST", "PUT"], description: "Manage bills and payments" },
    { path: "/notifications", methods: ["GET", "POST"], description: "Log and view notifications" },
    { path: "/rentSchedules", methods: ["GET", "PUT"], description: "View rent schedules, mark rent as paid" },
    { path: "/health", methods: ["GET"], description: "Check service health" },
  ];

  return res.status(200).json({
    ok: true,
    service: "PTM MVP API",
    baseUrl,
    availableRoutes: routes.map((r) => ({
      ...r,
      fullUrl: `${baseUrl}${r.path}`,
    })),
    timestamp: new Date().toISOString(),
  });
}
