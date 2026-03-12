import {decode, verify} from "hono/jwt";
import {Auth} from "../../db/auth.schema";
import {IAuthRepository} from "./IAuthRepository";
import {Config} from "../../config";
import RedisClient from "../../config/redis";
import JWTHelper from "../../helper/jwt";
import {HTTPException} from "hono/http-exception";
import {generateVerificationCode, sendVerificationEmail, sendVerificationSMS} from "../../helper/verification";

const VERIFICATION_TTL = 3 * 60 // 3 minutes in seconds

// Shared function to generate unique username from name
export async function generateUsername(name: string, repo: IAuthRepository): Promise<string> {
    const baseUsername = name.replace(/\s+/g, '').toLowerCase()

    const existingUsernames = await repo.findUsernamesByPrefix(baseUsername)

    if (existingUsernames.length === 0) {
        return baseUsername
    }
    
    if (!existingUsernames.includes(baseUsername)) {
        return baseUsername
    }

    let counter = 1
    while (existingUsernames.includes(`${baseUsername}${counter}`)) {
        counter++
    }

    return `${baseUsername}${counter}`
}

type RegisterData = {
    full_name: string
    username: string
    email?: string
    phone?: string
    password: string
    role: string
}

type LoginResult = {
    access_token: string
    refresh_token: string
    user: { id: string; full_name: string; username: string; role: string }
}

export class AuthService {
    constructor(private readonly repo: IAuthRepository) {
    }

    async register(data: RegisterData): Promise<Auth> {
        data.password = await Bun.password.hash(data.password, {algorithm: "bcrypt", cost: 10})
        return await this.repo.register(data)
    }

    async sendVerification(userId: string): Promise<void> {
        const user = await this.repo.findById(userId)
        if (!user) throw new HTTPException(404, {message: "User tidak ditemukan"})
        if (user.is_verified) throw new HTTPException(400, {message: "Akun sudah terverifikasi"})

        const code = generateVerificationCode()

        // Store in Redis with TTL
        const redis = await RedisClient.getInstance()
        await redis.setEx(`verify:${userId}`, VERIFICATION_TTL, code)

        // Send via email or phone
        if (user.email) {
            await sendVerificationEmail(user.email, code)
        } else if (user.phone) {
            await sendVerificationSMS(user.phone, code)
        }
    }

    async verifyAccount(userId: string, code: string): Promise<void> {
        const user = await this.repo.findById(userId)
        if (!user) throw new HTTPException(404, {message: "User tidak ditemukan"})
        if (user.is_verified) throw new HTTPException(400, {message: "Akun sudah terverifikasi"})

        const redis = await RedisClient.getInstance()
        const savedCode = await redis.get(`verify:${userId}`)

        if (!savedCode) {
            throw new HTTPException(400, {message: "Kode verifikasi tidak ditemukan atau sudah kadaluarsa"})
        }
        if (savedCode !== code) {
            throw new HTTPException(400, {message: "Kode verifikasi salah"})
        }

        // Delete code from Redis and mark user as verified
        await redis.del(`verify:${userId}`)
        await this.repo.setVerified(userId)
    }

    async login(identifier: string, password: string): Promise<LoginResult> {
        const user = await this.repo.findByIdentifier(identifier)
        if (!user) throw new HTTPException(404, {message: "User tidak ditemukan"})

        const isValid = await Bun.password.verify(password, user.password)
        if (!isValid) throw new HTTPException(401, {message: "Username/Email dan Password salah"})

        if (!user.is_verified) throw new HTTPException(403, {message: "Akun anda belum terverifikasi"})

        const refresh_token = await JWTHelper.GenerateRefreshToken(user.id)
        const access_token = await JWTHelper.GenerateAccessToken({
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            role: user.role
        })

        const redis = await RedisClient.getInstance()
        // Access token: 15 minutes (in seconds)
        const accessTTL = Config.EXPIRED_ACCESS_TOKEN * 60
        // Refresh token: 30 days (in seconds)
        const refreshTTL = Config.EXPIRED_REFRESH_TOKEN * 24 * 60 * 60
        
        await redis.setEx(`refresh:${user.id}`, refreshTTL, refresh_token)
        await redis.setEx(`access:${user.id}`, accessTTL, access_token)

        return {
            access_token,
            refresh_token,
            user: {id: user.id, full_name: user.full_name, username: user.username, role: user.role}
        }
    }

    async logout(id: string): Promise<void> {
        const redis = await RedisClient.getInstance()
        await redis.del(`refresh:${id}`)
        await redis.del(`access:${id}`)
    }

    async verifyToken(id: string): Promise<boolean> {
        const redis = await RedisClient.getInstance()
        const token = await redis.get(`refresh:${id}`)
        return !!token
    }

    async refreshToken(token: string): Promise<string> {
        // decode token
        const decoded = decode(token)

        // Cek apakah refresh token ada di redis
        const redis = await RedisClient.getInstance()
        const token_exist = await redis.get(`refresh:${decoded.payload.sub}`)

        // Jika tidak ada, maka return
        if (token != token_exist) throw new HTTPException(401, {message: "Token has been revoked"})

        // Jika ada,
        // Validasi exp refresh token
        const token_verified = await verify(token, Config.REFRESH_SECRET_KEY as string)

        // Jika token expired
        if (!token_verified) throw new HTTPException(401, {message: "Token expired"})

        // Generated access token
        // 1. Get User and check
        const user = await this.repo.findById(decoded.payload.sub as string)
        if (!user) throw new HTTPException(404, {message: "User tidak ditemukan"})

        // 2. Generate New Access Token
        const access_token = await JWTHelper.GenerateAccessToken({
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name
        })

        // 3. Save new access token into redis (15 minutes in seconds)
        const accessTTL = Config.EXPIRED_ACCESS_TOKEN * 60
        await redis.setEx(`access:${user.id}`, accessTTL, access_token)

        return access_token
    }
}