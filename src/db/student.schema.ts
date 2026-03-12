import {date, pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {ParentSchema} from "./parent.schema";
import {SchoolSchema} from "./school.schema";
import {genderTypeEnum} from "./auth.schema";

export const StudentSchema = pgTable("students", {
    id: uuid().primaryKey().defaultRandom(),
    school_id: uuid().notNull().references(() => SchoolSchema.id),
    parent_id: uuid().notNull().references(() => ParentSchema.id),
    nis: varchar({length: 50}),
    name: varchar({length: 255}).notNull(),
    nickname: varchar({length: 100}), // Nama Panggilan
    gender: genderTypeEnum(),
    birthday: date(),
    birthplace: varchar({length: 100}),
    address: text(),
    picture: varchar({length: 255}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Student = typeof StudentSchema.$inferSelect
export type CreateStudent = typeof StudentSchema.$inferInsert