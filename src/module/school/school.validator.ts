import z from "zod";

export const createSchoolValidation = z.object({
    school_name: z.string().min(5, "Nama sekolah wajib diisi"),
    address: z.string().min(1).optional(),
    school_type: z.enum(['negeri', 'swasta']).optional(),
    school_category: z.enum(['sps', 'tk', 'kb']).optional(),
    npsn: z.string().min(8).max(20).optional(),
    accreditation: z.enum(['A', 'B', 'C']).optional()
})

export const updateSchoolValidation = z.object({
    school_name: z.string().min(5, "Nama sekolah wajib minimal 5 huruf ").optional(),
    address: z.string().min(1).optional(),
    school_type: z.enum(['negeri', 'swasta']).optional(),
    school_category: z.enum(['sps', 'tk', 'kb']).optional(),
    npsn: z.string().min(8).max(20).optional(),
    accreditation: z.enum(['A', 'B', 'C']).optional()
})