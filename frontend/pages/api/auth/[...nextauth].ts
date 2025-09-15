// frontend/pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { getUserByEmail, verifyPassword } from "@/lib/googleSheets"; // must exist

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        const ok = await verifyPassword(credentials.password, user.password_hash || user.passwordHash || "");
        if (!ok) return null;

        // minimal user to put in token/session
        return {
          id: user.id,
          name: user.name || user.email,
          email: user.email,
          role: user.role || "tenant",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      (session as any).user = { ...(session as any).user, role: (token as any).role, id: (token as any).sub };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Default redirect after sign in
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};

export default NextAuth(authOptions);
