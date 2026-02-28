import z from "zod";
export const createTeacherValidation = z.object({
    school_name: z.string().min(1),
    id_attendance: z.string().min(1).optional(),
    name: z.string().min(1),
    address: z.string().min(3),
    kelurahan: z.string().min(1),
    kecamatan: z.string().min(1),
    kota: z.string().min(1),
    provinsi: z.string().min(1),
    academic: z.string().min(1).optional(),
    gender: z.enum(["laki-laki", "perempuan"]),
    email: z.email().optional(),
    phone: z.string().min(7).optional(),
    birthday: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    joindate: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    exitdate: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    picture: z.string().min(1).optional(),
})