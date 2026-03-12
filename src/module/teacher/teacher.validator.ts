import z from "zod";

export const createTeacherValidation = z.object({
    school_id: z.string().min(1),
    id_attendance: z.string().min(1).optional(),
    name: z.string().min(1),
    address: z.string().min(3),
    kelurahan: z.string().min(1),
    kecamatan: z.string().min(1),
    kota: z.string().min(1),
    provinsi: z.string().min(1),
    academic: z.string().min(1).optional(),
    gender: z.enum(["laki-laki", "perempuan"]),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    birthday: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    joindate: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    exitdate: z.coerce.date().transform(d => d.toISOString().split('T')[0]),
    picture: z.string().min(1).optional(),
})

export const updateTeacherValidation = z.object({
    id_attendance: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    address: z.string().min(3).optional(),
    kelurahan: z.string().min(1).optional(),
    kecamatan: z.string().min(1).optional(),
    kota: z.string().min(1).optional(),
    provinsi: z.string().min(1).optional(),
    academic: z.string().min(1).optional(),
    gender: z.enum(["laki-laki", "perempuan"]).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(7).optional(),
    birthday: z.coerce.date().transform(d => d.toISOString().split('T')[0]).optional(),
    joindate: z.coerce.date().transform(d => d.toISOString().split('T')[0]).optional(),
    exitdate: z.coerce.date().transform(d => d.toISOString().split('T')[0]).optional(),
    picture: z.string().min(1).optional(),
})