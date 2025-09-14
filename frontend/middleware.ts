import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      if (!token) return false;

      const role = (token as any).role;

      if (pathname.startsWith("/dashboard/admin")) {
        return role === "admin";
      }
      if (pathname.startsWith("/dashboard/manager")) {
        return role === "property_manager" || role === "admin";
      }
      if (pathname.startsWith("/dashboard/tenant")) {
        return role === "tenant";
      }
      if (pathname.startsWith("/dashboard/agent")) {
        return role === "agent";
      }
      return true;
    },
  },
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
