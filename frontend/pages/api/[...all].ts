import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Catch-all handler for unknown API routes.
 * Redirects to /api/index for documentation.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(404).json({
    ok: false,
    error: "Endpoint not found",
    redirect: "/api/index",
    timestamp: new Date().toISOString(),
  });
}
