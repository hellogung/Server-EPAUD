import {date, pgEnum, pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const genderTypeEnum = pgEnum("gender_type", ["laki-laki", "perempuan"])

export const TeacherSchema = pgTable("teachers", {
    id: uuid().primaryKey().defaultRandom(),
    school_name: varchar({ length: 255 }).notNull(),
    id_attendance: varchar({ length: 100 }),
    name: varchar({ length: 255 }).notNull(),
    address: text().notNull(),
    kelurahan: varchar({ length: 100 }).notNull(),
    kecamatan: varchar({ length: 100 }).notNull(),
    kota: varchar({ length: 100 }).notNull(),
    provinsi: varchar({ length: 100 }).notNull(),
    academic: varchar({ length: 255 }),
    gender: genderTypeEnum(),
    email: varchar({ length: 255 }),
    phone: varchar({ length: 50 }),
    birthday: date(),
    joindate: date(),
    exitdate: date(),
    picture: varchar({ length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Teacher = typeof TeacherSchema.$inferSelect
export type CreateTeacher = typeof TeacherSchema.$inferInsert