import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;
      const path = req.nextUrl.pathname;

      if (path.startsWith("/admin") && token.role !== "admin") return false;
      if (path.startsWith("/manager") && token.role !== "manager") return false;

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/manager/:path*", "/tenant/:path*"],
};
