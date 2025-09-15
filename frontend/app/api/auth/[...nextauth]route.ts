// frontend/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { verifyPassword, getUserByEmail, getUserById } from "@/lib/googleSheets";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await verifyPassword(credentials.email, credentials.password);
        if (!user) return null;
        // only return safe fields
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "tenant",
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  jwt: {
    // default from NEXTAUTH_SECRET
  },
  callbacks: {
    async jwt({ token, user }) {
      // on sign-in, attach role and id
      if (user) {
        token.role = (user as any).role || "tenant";
        token.id = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // after login redirect based on role (client-side fallback too)
      // don't allow external redirects
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin", // route we will create
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
