// frontend/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "@/lib/googleSheets";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email);
        if (!user) return null;
        if (user.status !== "approved") return null;
        const ok = await verifyPassword(credentials.email, credentials.password);
        if (!ok) return null;
        // NextAuth wants at least an `id` and `name`/`email`
        return { id: user.id, name: user.name || user.email, email: user.email, role: user.role || "tenant" };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user available at first sign-in
        token.role = (user as any).role || token.role;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).user = (session as any).user || {};
      (session as any).user.role = token.role || "tenant";
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
