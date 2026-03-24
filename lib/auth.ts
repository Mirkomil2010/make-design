import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getConvexHttpClient } from "@/lib/convex-server";
import { userRefs } from "@/lib/convex-refs";
import { verifyPassword } from "@/lib/password";
import {
  normalizeUsername,
  toLegacyUsernameIdentifier,
} from "@/lib/username";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = normalizeUsername(
          typeof credentials?.username === "string"
            ? credentials.username
            : "",
        );
        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        if (!username || !password) {
          return null;
        }

        try {
          const convex = getConvexHttpClient();
          let user = await convex.query(userRefs.getByUsername, { username });

          if (!user && username.includes("@")) {
            const legacyIdentifier = toLegacyUsernameIdentifier(username);
            if (legacyIdentifier !== username) {
              user = await convex.query(userRefs.getByUsername, {
                username: legacyIdentifier,
              });
            }
          }

          if (!user || !verifyPassword(password, user.passwordHash)) {
            return null;
          }

          await convex.mutation(userRefs.touchLogin, { userId: user._id });

          return {
            id: String(user._id),
            name: user.name ?? user.username,
          };
        } catch (error) {
          console.error("Credentials sign-in failed", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
      }
      return session;
    },
  },
};
