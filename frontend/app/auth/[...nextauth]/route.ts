// inside callbacks:
callbacks: {
  async jwt({ token, user }) {
    if (user) token.role = user.role;
    return token;
  },
  async session({ session, token }) {
    if (session.user) (session.user as any).role = token.role;
    return session;
  },
  async redirect({ baseUrl, url }) {
    // Role-based redirect after login
    if (url === "/") {
      if ((url as any).role === "admin") return `${baseUrl}/dashboard/admin`;
      if ((url as any).role === "property_admin") return `${baseUrl}/dashboard/property`;
      if ((url as any).role === "tenant") return `${baseUrl}/dashboard/tenant`;
    }
    if (url.startsWith("/")) return `${baseUrl}${url}`;
    return url.startsWith(baseUrl) ? url : baseUrl;
  },
},
