import {pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
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
    teacher_id: uuid().notNull().references(() => TeacherSchema.id)
})

export const StudentClassSchema = pgTable("student_classes", {
    id: uuid().primaryKey().defaultRandom(),
    class_id: uuid().notNull().references(() => ClassDataSchema.id),
    student_id: uuid().notNull().references(() => StudentSchema.id),
})

export const ClassSchema = pgTable("classes", {
    id: uuid().primaryKey().defaultRandom(),
    class_id: uuid().notNull().references(() => ClassDataSchema.id),
    student_id: uuid().notNull().references(() => StudentSchema.id),
    teacher_id: uuid().notNull().references(() => TeacherSchema.id),
    academic_year: varchar({length: 20}).notNull(),
})