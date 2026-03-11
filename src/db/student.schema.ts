import {pgTable, timestamp, uuid} from "drizzle-orm/pg-core";
import {ParentSchema} from "./parent.schema";

export const StudentSchema = pgTable("students", {
    id: uuid().primaryKey().defaultRandom(),
    parent_id: uuid().notNull().references(() => ParentSchema.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})