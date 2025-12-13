import { Context } from "hono";
import { AuthValidator } from "./auth.validator";
import { AuthService } from "./auth.service";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { WebResponse } from "../../type/WebResponse.type";
import { getCookie, setCookie } from "hono/cookie"
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

            // TODO: Store Refresh Token into HTTP Only Cookie
            setCookie(c, "refresh_token", data.refresh_token, {
                httpOnly: true,
                secure: Config.IS_PRODUCTION,
                path: "/api/auth/refresh",
                maxAge: 15 * 60 * 60 * 24 // 15 Hari
            })

            const response: WebResponse<any> = {
                message: "User berhasil login.",
                data: {
                    access_token: data.access_token,
                }
            }

            return c.json(response)
        } catch (error) {
            if (error instanceof HTTPException) {
                return c.json({ message: error.message }, error.status)
            } else if (error instanceof ZodError) {
                return c.json({ message: error.message })
            }
        }
    },
    refresh_token: async (c: Context) => {
        const refresh_token = getCookie(c, "refresh_token")

        if (!refresh_token) {
            return c.json({ message: "Unauthenticated" }, 401)
        }
        const access_token = await service.refresh_token(refresh_token)

        return c.json({ access_token: access_token })
    },

    profile: async (c: Context) => {
        try {
            const user = c.get("user")

            if (!user) throw new HTTPException(404, { message: "User not Found" })

            const response: WebResponse<any> = {
                message: "User berhasil login.",
                data: { user }
            }

            return c.json(response)
        } catch (error) {
            if (error instanceof HTTPException) {
                return c.json({ message: error.message }, error.status)
            }

            return c.json({ error })
        }
    }
})