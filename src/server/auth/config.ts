import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import { db } from "~/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "~/server/db/schema";

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

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    {
      id: "eve-sso",
      name: "EVE Online",
      type: "oauth",
      authorization: {
        url: "https://login.eveonline.com/v2/oauth/authorize",
        params: {
          scope: "esi-characters.read_characters.v1",
          response_type: "code",
        },
      },
      token: "https://login.eveonline.com/v2/oauth/token",
      userinfo: {
        url: "https://esi.evetech.net/verify/",
        async request({ tokens, provider }) {
          const response = await fetch("https://esi.evetech.net/verify/", {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });
          return await response.json();
        },
      },
      clientId: process.env.AUTH_EVE_CLIENT_ID,
      clientSecret: process.env.AUTH_EVE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.CharacterID.toString(),
          name: profile.CharacterName,
          email: null,
          image: `https://images.evetech.net/characters/${profile.CharacterID}/portrait?size=128`,
        };
      },
    },
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
