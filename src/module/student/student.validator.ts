import z from "zod";

export const createStudentValidation = z.object({
    parent_id: z.string().min(1),
    school_id: z.string().min(1),
    nis: z.string().min(1).optional(),
    name: z.string().min(1),
    nickname: z.string().min(1).optional(),
    gender: z.enum(["laki-laki", "perempuan"]).optional(),
    birthday: z.coerce.date().transform(d => d.toISOString().split('T')[0]).optional(),
    birthplace: z.string().min(1).optional(),
    address: z.string().min(3).optional(),
    picture: z.string().min(1).optional(),
})

export const updateStudentValidation = z.object({
    nis: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    nickname: z.string().min(1).optional(),
    gender: z.enum(["laki-laki", "perempuan"]).optional(),
    birthday: z.coerce.date().transform(d => d.toISOString().split('T')[0]).optional(),
    birthplace: z.string().min(1).optional(),
    address: z.string().min(3).optional(),
    picture: z.string().min(1).optional(),
})
