import z from "zod"

export class AuthValidator {
    public static register() {
        return z.object({
            full_name: z.string().min(1),
            username: z.string().min(1),
            password: z.string().min(1),
            role: z.string().min(1).default("user")
        })
    }

    public static login() {
        return z.object({
            username: z.string().min(1),
            password: z.string().min(1)
        })
    }

    public static idParam() {
        return z.object({
            id: z.string().min(1)
        })
    }
}