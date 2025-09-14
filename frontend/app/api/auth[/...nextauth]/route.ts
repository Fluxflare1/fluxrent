import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sheets } from "@/lib/google-sheets"; // Google Sheets helper

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEET_ID!,
            range: "Users!A2:D", // [id, email, passwordHash, role]
          });

          const rows = res.data.values || [];
          const user = rows.find((row) => row[1] === credentials.email);

          if (user && await bcrypt.compare(credentials.password, user[2])) {
            return { id: user[0], email: user[1], role: user[3] };
          }
          return null;
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
    async redirect({ baseUrl, url, token }) {
      // Role-based dashboard redirect
      if (url === "/" && token?.role) {
        if (token.role === "admin") return `${baseUrl}/dashboard/admin`;
        if (token.role === "property_admin") return `${baseUrl}/dashboard/property`;
        if (token.role === "tenant") return `${baseUrl}/dashboard/tenant`;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
