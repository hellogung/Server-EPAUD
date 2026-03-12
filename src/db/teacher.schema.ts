import {date, pgEnum, pgTable, primaryKey, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {SchoolSchema} from "./school.schema";
import {AuthSchema, genderTypeEnum} from "./auth.schema";

export const TeacherSchema = pgTable("teachers", {
        id: uuid().primaryKey().defaultRandom(),
        user_id: uuid().notNull().references(() => AuthSchema.id),
        school_id: uuid().notNull().references(() => SchoolSchema.id),
        id_attendance: varchar({length: 100}),
        name: varchar({length: 255}).notNull(),
        address: text().notNull(),
        kelurahan: varchar({length: 100}).notNull(),
        kecamatan: varchar({length: 100}).notNull(),
        kota: varchar({length: 100}).notNull(),
        provinsi: varchar({length: 100}).notNull(),
        academic: varchar({length: 255}),
        gender: genderTypeEnum(),
        email: varchar({length: 255}),
        phone: varchar({length: 50}),
        birthday: date(),
        joindate: date(),
        exitdate: date(),
        picture: varchar({length: 255}),
        createdAt: timestamp('created_at').defaultNow().notNull(),
        updatedAt: timestamp('updated_at').defaultNow().notNull(),
    }
)

export type Teacher = typeof TeacherSchema.$inferSelect
export type CreateTeacher = typeof TeacherSchema.$inferInsert