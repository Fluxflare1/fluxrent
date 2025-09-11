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
