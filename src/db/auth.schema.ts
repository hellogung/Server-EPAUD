import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const AuthSchema = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    full_name: varchar({ length: 255 }).notNull(),
    username: varchar({ length: 255 }).unique().notNull(),
    email: varchar({ length: 255 }).unique(),
    phone: varchar({ length: 20 }).unique(),
    password: varchar({ length: 255 }).notNull(),
    token: varchar({ length: 500 }).unique(),
    role: varchar({ length: 50 }).notNull().default("user"),
    is_verified: boolean().notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
export type Auth = typeof AuthSchema.$inferSelect
export type CreateAuth = typeof AuthSchema.$inferInsert
