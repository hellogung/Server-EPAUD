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

// ID, ID Absensi, Id Guru, Id Siswa

// Presensi
// ID
// G001
// S001
// Datetime

// # Per sekolah punya jadwal masuk pulang
// SPS Padu Ceria  guru  Senin   07:00   15:00
// SPS Padu Ceria  guru  ...     07:00   15:00
// SPS Padu Ceria  guru  Jumat   07:00   15:30
//
// SPS Padu Ceria  siswa  Senin   08:00   12:00
// SPS Padu Ceria  siswa  ...     08:00   12:00
// SPS Padu Ceria  siswa  Jumat   08:00   12:30