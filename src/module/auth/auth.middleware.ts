import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { Config } from "../../config";
import type { JWTPayload } from "hono/utils/jwt/types";
import JWTHelper from "../../helper/jwt";
import RedisClient from "../../config/redis";

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

            if (!payload) return c.json({ message: "Unathorized" }, 401)

            const cureent = Math.floor(Date.now() / 1000)
            if (payload.exp! < cureent) {
                // ! HARUSNYA DIBUAT API REFRESH TOKEN
                const redis = await RedisClient.getInstance()
                const refresh_token = await redis.get(`refresh:${payload.username}`) as string
                const access_token = await JWTHelper.GenerateAccessToken(refresh_token, {
                    full_name: payload.full_name as string,
                    username: payload.username as string,
                    role: payload.role as string
                })

                await redis.setEx(
                    `access:${payload.username}`,
                    Config.EXPIRED_ACCESS_TOKEN * 60,
                    access_token
                )
            }

            // Simpan payload ke context
            c.set("user", {
                id: payload.sub,
                full_name: payload.full_name,
                username: payload.username,
                role: payload.role
            })

            await next()
        } catch (error) {
            return c.json({ message: "Invalid or expired token" }, 401);
        }
    }

    static role(...allowedRoles: string[]) {
        return async (c: Context, next: Next) => {
            const user = c.get("user")

            console.log(user.role)

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