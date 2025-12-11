import { verify } from "hono/jwt";
import { Auth, CreateAuth } from "../../db/schema";
import { IAuthRepository } from "./IAuthRepository";
import { Config } from "../../config";
import type { JWTPayload } from "hono/utils/jwt/types";
import RedisClient from "../../config/redis";
import JWTHelper from "../../helper/jwt";

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

    async login(data: { username: string, password: string }): Promise<{ access_token: string, refresh_token: string }> {
        const user = await this.repo.login(data)

        const refresh_token = await JWTHelper.GenerateRefreshToken(user.id)
        const access_token = await JWTHelper.GenerateAccessToken(refresh_token, {
            full_name: user.full_name,
            username: user.username,
            role: user.role
        })

        // Save token into Redis
        const redis = await RedisClient.getInstance()
        await redis.setEx(
            `refresh:${user.username}`,
            Config.EXPIRED_REFRESH_TOKEN * 60 * 60 * 24,
            refresh_token
        )

        await redis.setEx(
            `access:${user.username}`,
            Config.EXPIRED_ACCESS_TOKEN * 60,
            access_token
        )

        return { access_token, refresh_token }
    }

    async verify(token: string): Promise<JWTPayload> {
        const decode = await verify(token, Config.ACCESS_SECRET_KEY as string)
        return decode
    }

    // async profile(id: string): Promise<boolean> {

    // }

    // async logout(id: number): Promise<string> {
    //     return await this.repo.logout(id)
    // }
}