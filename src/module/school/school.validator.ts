import z from "zod";

export const createSchoolValidation = z.object({
    school_name: z.string()
})