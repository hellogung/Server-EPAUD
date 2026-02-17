import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { Config } from "../../config";
import type { JWTPayload } from "hono/utils/jwt/types";
import JWTHelper from "../../helper/jwt";
import RedisClient from "../../config/redis";
import { getCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";

class AuthMiddleware {
    static async check(c: Context, next: Next) {
        const authorization = c.req.header("Authorization")

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return c.json({
                message: "Unathorized"
            }, 401)
        }

        const token = authorization.split(" ")[1]

        try {
            const payload: JWTPayload = await verify(token, Config.ACCESS_SECRET_KEY as string)

            if (!payload) throw new HTTPException(401, { message: "Token Invalid" })

            // Simpan payload ke context
            c.set("user", {
                id: payload.sub,
                full_name: payload.full_name,
                username: payload.username,
                role: payload.role
            })

            await next()
        } catch (err) {

            if (err instanceof HTTPException) {
                return c.json({ message: err.message }, err.status)
            }

            const error = err instanceof Error ? err : new Error

            if (error.message.includes("jwt expired")) {
                // Cek jika token expired
                return c.json({ message: "Token expired" }, 401)
            } else {
                return c.json(error)
            }
        }
    }

    static role(...allowedRoles: string[]) {
        return async (c: Context, next: Next) => {
            const user = c.get("user")

            if (!user) {
                return c.json({
                    message: "Unauthorized: User tidak ditemukan"
                }, 401)
            }

            if (!allowedRoles.includes(user.role)) {
                return c.json({
                    message: `Forbidden: Anda tidak diperbolehkan untuk mengakses ini.`
                }, 403)
            }

            await next()
        }
    }
}

export default AuthMiddleware