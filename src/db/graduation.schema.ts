import {pgEnum, pgTable, uuid, varchar, text, timestamp, integer} from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";
import {StudentSchema} from "./student.schema";
import {SchoolSchema} from "./school.schema";

// ─── ENUM ────────────────────────────────────────────────────────────────────

export const GraduationStatusEnum = pgEnum("graduation_status", [
    "graduated",     // lulus
    "not_graduated", // tidak lulus
    "dropout",       // keluar/pindah
]);

// ─── GRADUATION ──────────────────────────────────────────────────────────────

export const GraduationSchema = pgTable("graduations", {
    id: uuid().primaryKey().defaultRandom(),
    school_id: uuid().notNull().references(() => SchoolSchema.id, {onDelete: "cascade"}),
    student_id: uuid().notNull().references(() => StudentSchema.id, {onDelete: "cascade"}),

    status: GraduationStatusEnum("status").notNull(),
    graduation_date: timestamp({withTimezone: true}),     // tanggal kelulusan
    academic_year: varchar({length: 20}).notNull(),     // e.g. "2024/2025"
    grade: integer(),                             // nilai akhir / rata-rata

    // Ijazah
    certificate_number: varchar({length: 100}),              // nomor ijazah
    certificate_path: text(),                                // path file ijazah
    certificate_at: timestamp({withTimezone: true}),     // tanggal ijazah diterbitkan

    note: text(),
    created_by: uuid().notNull(),
    created_at: timestamp({withTimezone: true}).defaultNow(),
    updated_at: timestamp({withTimezone: true}).defaultNow(),
}, (t) => [
    // 1 siswa hanya boleh punya 1 data kelulusan per tahun ajaran
    sql`CONSTRAINT uq_graduation_student_year UNIQUE (
    ${t.student_id},
    ${t.academic_year}
    )`,

    // Nomor ijazah harus unik kalau diisi
    sql`CONSTRAINT uq_certificate_number UNIQUE (
    ${t.certificate_number}
    )`,

    // certificate_path wajib ada kalau status = graduated
    sql`CONSTRAINT chk_certificate CHECK (
    ${t.status}
    !=
    'graduated'
    OR
    ${t.certificate_path}
    IS NOT NULL
    )`,
]);

// Types
export type Graduation = typeof GraduationSchema.$inferSelect
export type CreateGraduation = typeof GraduationSchema.$inferInsert