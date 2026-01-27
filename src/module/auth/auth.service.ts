import { decode, verify } from "hono/jwt";
import { Auth, CreateAuth } from "../../db/schema";
import { IAuthRepository } from "./IAuthRepository";
import { Config } from "../../config";
import { JwtPayloadRequiresAud, type JWTPayload } from "hono/utils/jwt/types";
import RedisClient from "../../config/redis";
import JWTHelper from "../../helper/jwt";
import { HTTPException } from "hono/http-exception";

export class AuthService {
    constructor(private readonly repo: IAuthRepository) { }

    async register(data: CreateAuth): Promise<Auth> {
        // Hash Password
        data.password = await Bun.password.hash(data.password, {
            algorithm: "bcrypt",
            cost: 10
        })

        return await this.repo.register(data)
    }

    async login(data: { username: string, password: string }): Promise<{
        access_token: string,
        refresh_token: string,
        user: {
            id: string,
            full_name: string,
            username: string,
            role: string
        }
    }> {
        const user: Auth | null = await this.repo.login(data)

        if (!user) {
            throw new HTTPException(401, { message: "Username/Password Invalid" })
        }

        const is_valid = await Bun.password.verify(data.password, user.password)
        console.log(is_valid)
        if (!is_valid) {
            throw new HTTPException(401, { message: "Username/Password Invalid" })
        }

        const refresh_token = await JWTHelper.GenerateRefreshToken(user.id)
        const access_token = await JWTHelper.GenerateAccessToken(refresh_token, {
            full_name: user.full_name,
            username: user.username,
            role: user.role
        })

        // Save token into Redis
        const redis = await RedisClient.getInstance()
        await redis.setEx(
            `refresh:${user.id}`,
            Config.EXPIRED_REFRESH_TOKEN * 60 * 60 * 24,
            refresh_token
        )

        return {
            access_token, refresh_token, user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                role: user.role
            }
        }
    }

    async refresh_token(token: string): Promise<string> {
        type JwtPayloadCustom = {
            username: string
            role: string
            full_name: string
        }

        const token_verified = await verify(token, Config.REFRESH_SECRET_KEY as string)
        const payload = token_verified // as JWTPayload & JwtPayloadCustom

        const redis = await RedisClient.getInstance()
        const saved_token = await redis.get(`refresh:${payload.sub}`)

        if (saved_token !== token) {
            throw new Error("Invalid refresh token")
        }
        // const payload = decoded.payload as JWTPayload & JwtPayloadCustom

        const user = await this.repo.profile(payload.sub as string)

        const new_token = await JWTHelper.GenerateAccessToken(token, {
            username: user.username,
            role: user.role,
            full_name: user.full_name
        })

        return new_token
    }
}