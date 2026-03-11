import {pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {SchoolSchema} from "./school.schema";
import {AuthSchema} from "./auth.schema";

export const ParentSchema = pgTable("parents", {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid().notNull().references(() => AuthSchema.id),
    school_id: uuid().notNull().references(() => SchoolSchema.id),
    name: varchar({length: 255}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})