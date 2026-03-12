import z from "zod";

// Regex untuk format tahun pelajaran: "2025-2026"
const academicYearRegex = /^\d{4}-\d{4}$/

export const createClassValidation = z.object({
    school_id: z.string().uuid(),
    name: z.string().min(1),
})

export const updateClassValidation = z.object({
    name: z.string().min(1).optional(),
})

export const assignTeacherValidation = z.object({
    teacher_id: z.string().uuid(),
    academic_year: z.string().regex(academicYearRegex, "Format tahun pelajaran: 2025-2026"),
    semester: z.number().int().min(1).max(2),
})

export const assignStudentValidation = z.object({
    student_id: z.string().uuid(),
    academic_year: z.string().regex(academicYearRegex, "Format tahun pelajaran: 2025-2026"),
    semester: z.number().int().min(1).max(2),
})

// Bulk assign validations
export const bulkAssignTeachersValidation = z.object({
    teacher_ids: z.array(z.string().uuid()).min(1, "Minimal 1 guru harus dipilih"),
    academic_year: z.string().regex(academicYearRegex, "Format tahun pelajaran: 2025-2026"),
    semester: z.number().int().min(1).max(2),
})

export const bulkAssignStudentsValidation = z.object({
    student_ids: z.array(z.string().uuid()).min(1, "Minimal 1 siswa harus dipilih"),
    academic_year: z.string().regex(academicYearRegex, "Format tahun pelajaran: 2025-2026"),
    semester: z.number().int().min(1).max(2),
})
