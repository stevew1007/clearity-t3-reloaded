import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTableCreator,
  primaryKey,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `clearity-t3-reloaded_${name}`,
);

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
  password: d.varchar({ length: 255 }), // For email/password authentication
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  eveCharacters: many(eveCharacters),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const eveCharacters = createTable(
  "eve_character",
  (d) => ({
    id: d.serial().primaryKey(),
    characterId: d.bigint({ mode: "number" }).notNull().unique(),
    characterName: d.varchar({ length: 255 }).notNull(),
    corporationId: d.bigint({ mode: "number" }),
    corporationName: d.varchar({ length: 255 }),
    allianceId: d.bigint({ mode: "number" }),
    allianceName: d.varchar({ length: 255 }),
    portraitUrl: d.varchar({ length: 512 }),
    provider: d.varchar({ length: 255 }).notNull().default("eveonline"),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: d
      .timestamp({ withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("eve_character_user_id_idx").on(t.userId),
    index("eve_character_character_id_idx").on(t.characterId),
    foreignKey({
      columns: [t.provider, t.providerAccountId],
      foreignColumns: [accounts.provider, accounts.providerAccountId],
    }),
  ],
);

export const eveCharactersRelations = relations(eveCharacters, ({ one }) => ({
  user: one(users, { fields: [eveCharacters.userId], references: [users.id] }),
  account: one(accounts, {
    fields: [eveCharacters.provider, eveCharacters.providerAccountId],
    references: [accounts.provider, accounts.providerAccountId],
  }),
}));
