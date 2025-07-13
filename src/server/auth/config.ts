import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";
import { env } from "~/env";
import EveonlineProvider from "./provider";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    Discord({
      clientId: env.AUTH_DISCORD_ID,
      clientSecret: env.AUTH_DISCORD_SECRET,
    }),
    EveonlineProvider({
      clientId: env.EVE_CLIENT_ID,
      clientSecret: env.EVE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Type guards to ensure we have strings
          const email = credentials.email;
          const password = credentials.password;
          if (typeof email !== "string" || typeof password !== "string") {
            return null;
          }

          // Check if user exists in database
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (user.length === 0) {
            return null;
          }

          const dbUser = user[0]!; // Safe because we checked length above

          // Verify password using bcrypt
          if (!dbUser.password) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            password,
            dbUser.password,
          );

          if (isValidPassword) {
            return {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              image: dbUser.image,
            };
          } else {
            return null;
          }
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Redirect to root after successful signin
      if (url === baseUrl + "/login") {
        return baseUrl + "/";
      }
      // If url is relative, make it absolute
      if (url.startsWith("/")) {
        return baseUrl + url;
      }
      // If url is on same origin, allow it
      if (new URL(url).origin === baseUrl) {
        return url;
      }
      // Otherwise redirect to base URL
      return baseUrl + "/";
    },
    authorized({ auth }) {
      // Require authentication for all matched routes
      return !!auth?.user;
    },
    async signIn({ user, account }) {
      // If signup is disabled, only allow existing users to sign in
      if (process.env.ENABLE_SIGNUP !== "true") {
        // For OAuth providers (Discord), check if user already exists
        if (account?.provider === "discord" && user.email) {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          if (existingUser.length === 0) {
            console.warn(
              `User with email ${user.email} does not exist and signup is disabled.`,
            );
            // User doesn't exist and signup is disabled - redirect to error page
            return "/auth/error?error=AccessDenied";
          }
        }
      }

      // For Discord users, ensure they have an avatar
      if (account?.provider === "discord" && user.email && user.name) {
        try {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);

          console.log("Existing user:", existingUser);

          if (existingUser.length > 0 && !existingUser[0]!.image) {
            // User exists but has no image, generate one
            const avatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`;

            await db
              .update(users)
              .set({ image: avatarUrl })
              .where(eq(users.email, user.email));
          }
        } catch (error) {
          console.error("Error updating Discord user avatar:", error);
          // Don't fail signin for avatar issues
        }
      }

      // Allow sign in (either signup is enabled or user exists)
      return true;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub,
      },
    }),
    jwt: ({ token, user }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
