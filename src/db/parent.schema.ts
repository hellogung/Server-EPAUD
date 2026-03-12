import {pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {SchoolSchema} from "./school.schema";
import {AuthSchema, genderTypeEnum} from "./auth.schema";

export const ParentSchema = pgTable("parents", {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid().notNull().references(() => AuthSchema.id),
    school_id: uuid().notNull().references(() => SchoolSchema.id),
    name: varchar({length: 255}).notNull(),
    address: text(),
    gender: genderTypeEnum(),
    occupation: varchar({length: 255}), // Pekerjaan
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Parent = typeof ParentSchema.$inferSelect
export type CreateParent = typeof ParentSchema.$inferInsert