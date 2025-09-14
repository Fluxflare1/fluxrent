// frontend/pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextApiHandler } from "next";
import { getUserByEmail, verifyPassword } from "@/lib/googleSheets";

const handler: NextApiHandler = async (req, res) => {
  return NextAuth(req, res, {
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "text", placeholder: "you@example.com" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;
          const user = await getUserByEmail(credentials.email);
          if (!user) return null;
          if (user.status !== "approved") return null;
          const ok = await verifyPassword(credentials.password, user.password_hash || "");
          if (!ok) return null;

          // return a user object for the session
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            uid: user.uid,
          };
        },
      }),
    ],
    session: {
      strategy: "jwt",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = (user as any).role;
          token.uid = (user as any).uid;
        }
        return token;
      },
      async session({ session, token }) {
        (session as any).user.role = token.role;
        (session as any).user.uid = token.uid;
        return session;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/auth/signin",
    },
  });
};

export default handler;
