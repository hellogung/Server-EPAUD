import z from "zod";

export const createGraduationValidation = z.object({
    school_id: z.string().uuid(),
    student_id: z.string().uuid(),
    status: z.enum(["graduated", "not_graduated", "dropout"]),
    graduation_date: z.string().datetime().optional(),
    academic_year: z.string().min(1), // e.g. "2024/2025"
    grade: z.number().int().min(0).max(100).optional(),
    certificate_number: z.string().optional(),
    certificate_path: z.string().optional(),
    certificate_at: z.string().datetime().optional(),
    note: z.string().optional(),
})

export const updateGraduationValidation = z.object({
    status: z.enum(["graduated", "not_graduated", "dropout"]).optional(),
    graduation_date: z.string().datetime().optional(),
    grade: z.number().int().min(0).max(100).optional(),
    certificate_number: z.string().optional(),
    certificate_path: z.string().optional(),
    certificate_at: z.string().datetime().optional(),
    note: z.string().optional(),
})
