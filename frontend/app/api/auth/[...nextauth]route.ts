// frontend/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { google } from "googleapis";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Build Google Auth directly here (no external lib dependency)
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

        if (!clientEmail || !privateKey || !process.env.GOOGLE_SHEETS_ID) {
          console.error("Missing Google credentials or sheet id for auth.");
          return null;
        }

        const auth = new google.auth.GoogleAuth({
          credentials: { client_email: clientEmail, private_key: privateKey },
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"]
        });

        const sheets = google.sheets({ version: "v4", auth });

        try {
          // Expect a sheet "Users" with columns: id | email | passwordHash | role | name
          const res = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
            range: "Users!A2:E"
          });

          const rows = res.data.values || [];
          const found = rows.find((r: any[]) => (r[1] || "").toLowerCase() === credentials.email.toLowerCase());

          if (!found) return null;
          const [id, email, passwordHash, role = "tenant", name = ""] = found;

          const isValid = await bcrypt.compare(credentials.password, passwordHash || "");
          if (!isValid) return null;

          return { id, email, role, name };
        } catch (err) {
          console.error("Authorize error (NextAuth):", err);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
    async redirect({ url, baseUrl, token }) {
      // After sign in, redirect to role-based dashboard
      if (token?.role) {
        if (token.role === "admin") return `${baseUrl}/dashboard/admin`;
        if (token.role === "property_admin" || token.role === "manager") return `${baseUrl}/dashboard/manager`;
        if (token.role === "tenant") return `${baseUrl}/dashboard/tenant`;
      }
      // default
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    }
  },

  pages: {
    signIn: "/auth/signin"
  },

  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };
