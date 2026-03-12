import z from "zod";

export const createParentValidation = z.object({
    school_id: z.string().min(1),
    name: z.string().min(1),
    address: z.string().min(3).optional(),
    gender: z.enum(["laki-laki", "perempuan"]).optional(),
    occupation: z.string().min(1).optional(),
})

export const updateParentValidation = z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(3).optional(),
    gender: z.enum(["laki-laki", "perempuan"]).optional(),
    occupation: z.string().min(1).optional(),
})
