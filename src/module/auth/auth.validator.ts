import z from "zod"

export class AuthValidator {
    static register() {
        return z.object({
            nama_sekolah: z.string().min(1, "Nama sekolah wajib diisi"),
            nama_kepala_sekolah: z.string().min(1, "Nama kepala sekolah wajib diisi"),
            email: z.string().email("Format email tidak valid").optional(),
            phone: z.string().min(10).max(15).optional(),
            password: z.string().min(6, "Password minimal 6 karakter"),
        }).refine(
            (data) => data.email || data.phone,
            { message: "Email atau nomor telepon wajib diisi", path: ["email"] }
        )
    }

    static sendVerification() {
        return z.object({
            user_id: z.string().uuid(),
            type: z.enum(["email", "phone"])
        })
    }

    static verify() {
        return z.object({
            user_id: z.string().uuid(),
            code: z.string().length(6, "Kode verifikasi harus 6 digit"),
            type: z.enum(["email", "phone"])
        })
    }

    static login() {
        return z.object({
            identifier: z.string().min(1, "Username/email/phone wajib diisi"),
            password: z.string().min(1, "Password wajib diisi")
        })
    }
}