import { pgTable, primaryKey, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { AuthSchema } from "./auth.schema";
import { SchoolSchema } from "./school.schema";

export const UserSchoolSchema = pgTable("user_schools", {
    user_id: uuid().notNull().references(() => AuthSchema.id),
    school_id: uuid().notNull().references(() => SchoolSchema.id),
    role: varchar({ length: 255 }).notNull().default("admin"),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
    primaryKey({ columns: [table.user_id, table.school_id] }),
])

export type UserSchool = typeof UserSchoolSchema.$inferSelect
export type CreateUserSchool = typeof UserSchoolSchema.$inferInsert
