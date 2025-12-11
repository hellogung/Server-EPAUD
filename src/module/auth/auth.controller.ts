import { Context } from "hono";
import { AuthValidator } from "./auth.validator";
import { AuthService } from "./auth.service";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { WebResponse } from "../../type/WebResponse.type";
import { setCookie } from "hono/cookie"
import { Config } from "../../config";

export const AuthController = (service: AuthService) => ({
    register: async (c: Context) => {
        try {
            const body = await c.req.json()
            const validate = AuthValidator.register().parse(body)

            const data = await service.register(validate)

            const response: WebResponse<any> = {
                message: "User berhasil ditambahkan.",
                data: data,
            }

            return c.json(response)
        } catch (error) {
            if (error instanceof HTTPException) {
                return c.json({ message: error.message })
            } else if (error instanceof ZodError) {
                return c.json({ message: error.message })
            }
        }
    },
    login: async (c: Context) => {
        try {
            const body = await c.req.json()
            const validate = AuthValidator.login().parse(body)

            const data = await service.login(validate)

            const response: WebResponse<any> = {
                message: "User berhasil login.",
                data: data,
            }

            // Kenapa pake ini, karena ada Bug Hono tidak bisa set Cookie 2 kali
            // c.header('Set-Cookie', `access_token=${data.access_token}; HttpOnly; ${Config.IS_PRODUCTION ? 'Secure;' : ''} SameSite=${Config.IS_PRODUCTION ? 'Strict' : 'Lax'}; Path=/; Max-Age=${Config.EXPIRED_ACCESS_TOKEN * 60}`, { append: true })
            // c.header('Set-Cookie', `refresh_token=${data.refresh_token}; HttpOnly; ${Config.IS_PRODUCTION ? 'Secure;' : ''} SameSite=${Config.IS_PRODUCTION ? 'Strict' : 'Lax'}; Path=/; Max-Age=${Config.EXPIRED_REFRESH_TOKEN * 60 * 60 * 24}`, { append: true })

            // Tidak jadi pake httpOnly Cookie karena mau pake Authorization Bearer

            return c.json(response)
        } catch (error) {
            if (error instanceof HTTPException) {
                return c.json({ message: error.message })
            } else if (error instanceof ZodError) {
                return c.json({ message: error.message })
            }
        }
    },

    verify: async (c: Context) => {
        return c.json({
            message: "Success"
        })
    }

    // profile: async (c: Context) => {

    // }
})