import {pgEnum, pgTable, time, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {TeacherSchema} from "./teacher.schema";
import {StudentSchema} from "./student.schema";
import {SchoolSchema} from "./school.schema";

export const AttendanceUserSchema = pgTable("attendances_users", {
    id: uuid().primaryKey().defaultRandom(),
    attendance_user_id: varchar({length: 100}).notNull().unique(),
    teacher_id: uuid().references(() => TeacherSchema.id),
    student_id: uuid().references(() => StudentSchema.id),
})

export const AttendanceSchema = pgTable("attendances", {
    id: uuid().primaryKey().defaultRandom(),
    attendance_id: varchar({length: 100}).notNull().references(() => AttendanceUserSchema.attendance_user_id),
    datetime_in: timestamp({withTimezone: true}),
    datetime_out: timestamp({withTimezone: true}),
})

export const TypeUserAttendance = pgEnum("type_user_attendance", ["teacher", "student"]);
export const ScheduleAttendanceSchoolSchema = pgTable("schedule_attendance_schools", {
    id: uuid().primaryKey().defaultRandom(),
    school_id: uuid().references(() => SchoolSchema.id),
    type: TypeUserAttendance(),
    day: varchar({length: 100}).notNull(),
    in: time().notNull(),
    out: time().notNull(),
})

// Types
export type AttendanceUser = typeof AttendanceUserSchema.$inferSelect
export type CreateAttendanceUser = typeof AttendanceUserSchema.$inferInsert

export type Attendance = typeof AttendanceSchema.$inferSelect
export type CreateAttendance = typeof AttendanceSchema.$inferInsert

export type ScheduleAttendanceSchool = typeof ScheduleAttendanceSchoolSchema.$inferSelect
export type CreateScheduleAttendanceSchool = typeof ScheduleAttendanceSchoolSchema.$inferInsert