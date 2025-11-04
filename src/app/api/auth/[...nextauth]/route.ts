import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";
import { userService } from "@/services/userService";

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
        const isAllowed = allowedDomains.some(domain => email.endsWith(domain));
        
        if (isAllowed && profile) {
          try {
            // create or update user in database
            await userService.createOrUpdateUser({
              id: profile.sub!, // stored as text in database
              email: profile.email!,
              name: profile.name!,
              image: (profile as any).picture
            });
          } catch (error) {
            console.error("Error creating/updating user:", error);
            return false; // Deny sign in if database operation fails
          }
        }
        
        return isAllowed;
      }
      return true;
    },
    async jwt({ token, profile, account }) {
      if (profile?.email) {
        try {
          // get user from database to include database ID and role
          const dbUser = await userService.findByEmail(profile.email);
          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role;
            token.email = dbUser.email;
            token.name = dbUser.name;
          }
        } catch (error) {
          console.error("Error fetching user from database:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).userId = token.userId;
        (session.user as any).role = token.role;
        (session.user as any).email = token.email;
        (session.user as any).name = token.name;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };