import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(200).json({
    ok: true,
    message: "Service healthy",
    timestamp: new Date().toISOString(),
  });
}
