import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        // Map roles from Users sheet
        token.role = await getUserRole(profile.email as string);
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      return session;
    },
  },
});

async function getUserRole(email: string): Promise<string> {
  // Load from Users sheet
  const { googleSheets } = await import("@/lib/googleSheets");
  const sheets = await googleSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "Users!A:C",
  });
  const rows = res.data.values || [];
  const user = rows.find((r) => r[1] === email);
  return user ? user[2] : "tenant"; // default role
}
