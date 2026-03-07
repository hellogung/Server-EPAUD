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

    static async GenerateAccessToken(data: {id: string, username: string, role: string, full_name: string}): Promise<string> {
        // Generate Refresh Token
        const accessPayload : dataType = {
            sub: data.id,
            full_name: data.full_name,
            username: data.username,
            role: data.role,
            exp: Math.floor(Date.now() / 1000) + 60 * Config.EXPIRED_ACCESS_TOKEN
        }

        return await sign(accessPayload, Config.ACCESS_SECRET_KEY as string)
    }
}

export default JWTHelper