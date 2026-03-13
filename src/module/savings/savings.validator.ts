import z from "zod";

export const createSavingsValidation = z.object({
    school_id: z.string().uuid(),
    student_id: z.string().uuid(),
})

export const depositValidation = z.object({
    student_id: z.string().uuid(),
    amount: z.number().positive("Jumlah harus lebih dari 0"),
    note: z.string().optional(),
})

export const withdrawValidation = z.object({
    student_id: z.string().uuid(),
    amount: z.number().positive("Jumlah harus lebih dari 0"),
    note: z.string().optional(),
})
