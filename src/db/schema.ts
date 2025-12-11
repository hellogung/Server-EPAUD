import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const SchoolSchema = pgTable("schools", {
    id: uuid().primaryKey().defaultRandom(),
    school_name: varchar({ length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

})
export type School = typeof SchoolSchema.$inferSelect
export type CreateSchool = typeof SchoolSchema.$inferInsert

export const AuthSchema = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    full_name: varchar({ length: 2255 }).notNull(),
    username: varchar({ length: 2255 }).unique().notNull(),
    password: varchar({ length: 2255 }).notNull(),
    token: varchar({ length: 2255 }).unique(),
    role: varchar({ length: 2255 }).notNull().default("user"),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
export type Auth = typeof AuthSchema.$inferSelect
export type CreateAuth = typeof AuthSchema.$inferInsert