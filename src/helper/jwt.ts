import { decode, sign } from "hono/jwt"
import { Config } from "../config"

type dataType = {
    sub?: string,
    full_name?: string,
    username?: string
    role?: string,
    exp: number
}

class JWTHelper {
    static async GenerateRefreshToken(userId: string): Promise<string> {
        const payload: dataType = {
            sub: userId,
            exp: Math.floor(Date.now() / 1000) + 60 * Config.EXPIRED_REFRESH_TOKEN
        }

        return await sign(payload, Config.REFRESH_SECRET_KEY as string)
    }

    static async GenerateAccessToken(token: string, data: {username: string, role: string, full_name: string}): Promise<string> {
        const { payload } = decode(token) as { payload: dataType }

        if (!payload) throw new Error("Invalid Token")

        const cureent = Math.floor(Date.now() / 1000) // seconds
        if (payload.exp < cureent) {
            throw new Error("Refresh Token expired")
        }

        // Generate Refresh Token
        const accessPayload : dataType = {
            sub: payload.sub,
            full_name: data.full_name,
            username: data.username,
            role: data.role,
            exp: Math.floor(Date.now() / 1000) + 60 * Config.EXPIRED_ACCESS_TOKEN
        }

        return await sign(accessPayload, Config.ACCESS_SECRET_KEY as string)
    }
}

export default JWTHelper