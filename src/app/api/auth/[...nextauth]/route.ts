import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Allow multiple email domains
        const allowedDomains = ["@ucla.edu", "@g.ucla.edu"];
        const email = profile?.email?.toLowerCase() ?? "";
        return allowedDomains.some(domain => email.endsWith(domain));
      }
      return true;
    },
    async jwt({ token, profile, account }) {
      if (profile?.email) {
        token.role = "writer"; 
        token.email = profile.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };