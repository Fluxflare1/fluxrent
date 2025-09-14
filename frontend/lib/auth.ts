import { getSession } from "next-auth/react";
// Minimal placeholder for role checks. Expand to NextAuth later.
export function isAdmin(session:any) {
  // session.user.role === 'super_admin' || 'property_manager'
  if (!session) return false
  return session.user?.role === 'super_admin' || session.user?.role === 'property_manager'
}



export async function requireRole(role: string) {
  const session = await getSession();
  if (!session || session.user.role !== role) {
    throw new Error("Unauthorized");
  }
}



// frontend/lib/auth.ts
import { getServerSession } from "next-auth/next";
import authOptions from "@/pages/api/auth/[...nextauth]"; // Note: importing the route's default is slightly hacky but works for callbacks
// However NextAuth exports a default handler; for typed usage you might re-export options separately.
// For now use client-side session hooks where needed.

export async function getSessionServer(req: any, res: any) {
  // Use NextAuth's getServerSession when you have access to Next.js handlers
  try {
    // @ts-ignore
    return await getServerSession(req, res, authOptions);
  } catch (err) {
    return null;
  }
}
