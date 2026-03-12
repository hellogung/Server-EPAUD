import {pgTable, timestamp, uuid, varchar, smallint} from "drizzle-orm/pg-core";
import {SchoolSchema} from "./school.schema";
import {TeacherSchema} from "./teacher.schema";
import {StudentSchema} from "./student.schema";

export const ClassDataSchema = pgTable("classes_data", {
    id: uuid().primaryKey().defaultRandom(),
    school_id: uuid().notNull().references(() => SchoolSchema.id),
    name: varchar({length: 100}).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const TeacherClassSchema = pgTable("teacher_classes", {
    id: uuid().primaryKey().defaultRandom(),
    class_id: uuid().notNull().references(() => ClassDataSchema.id),
    teacher_id: uuid().notNull().references(() => TeacherSchema.id),
    academic_year: varchar({length: 9}).notNull(), // Format: "2025-2026"
    semester: smallint().notNull(), // 1 or 2
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const StudentClassSchema = pgTable("student_classes", {
    id: uuid().primaryKey().defaultRandom(),
    class_id: uuid().notNull().references(() => ClassDataSchema.id),
    student_id: uuid().notNull().references(() => StudentSchema.id),
    academic_year: varchar({length: 9}).notNull(), // Format: "2025-2026"
    semester: smallint().notNull(), // 1 or 2
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Types
export type ClassData = typeof ClassDataSchema.$inferSelect
export type CreateClassData = typeof ClassDataSchema.$inferInsert

export type TeacherClass = typeof TeacherClassSchema.$inferSelect
export type CreateTeacherClass = typeof TeacherClassSchema.$inferInsert

export type StudentClass = typeof StudentClassSchema.$inferSelect
export type CreateStudentClass = typeof StudentClassSchema.$inferInsert