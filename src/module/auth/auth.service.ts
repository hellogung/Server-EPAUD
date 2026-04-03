import { decode, verify } from "hono/jwt";
import { Auth, AuthSchema } from "../../db/auth.schema";
import { IAuthRepository } from "./IAuthRepository";
import { Config } from "../../config";
import RedisClient from "../../config/redis";
import JWTHelper from "../../helper/jwt";
import { HTTPException } from "hono/http-exception";
import { generateVerificationCode, sendVerificationEmail, sendVerificationSMS } from "../../helper/verification";
import { and, ilike, or } from "drizzle-orm";
import { IUserSchoolRepository } from "../user_school/IUserSchoolRepository";

const VERIFICATION_TTL = 1 * 60 // 1 minutes in seconds

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

type GetAllParams = {
    search?: string
    role?: string
    limit: number
    offset: number
    page: number
}

export class AuthService {
    constructor(private readonly repo: IAuthRepository, private readonly userSchoolRepo: IUserSchoolRepository) {
    }

    async getAll({
        search,
        role,
        limit,
        offset,
    }: GetAllParams): Promise<{ data: Auth[], total: { count: number } }> {
        const searchCondition = search ? or(
            ilike(AuthSchema.full_name, `%${search}%`),
            ilike(AuthSchema.username, `%${search}%`),
            ilike(AuthSchema.email, `%${search}%`),
            ilike(AuthSchema.phone, `%${search}%`)
        ) : undefined

        const roleCondition = role ? ilike(AuthSchema.role, role) : undefined

        const condition = searchCondition && roleCondition
            ? and(searchCondition, roleCondition)
            : searchCondition || roleCondition

        return await this.repo.getAll({ condition, limit, offset })
    }

    async register(data: RegisterData): Promise<Auth> {
        data.password = await Bun.password.hash(data.password, { algorithm: "bcrypt", cost: 10 })
        return await this.repo.register(data)
    }

    async sendVerification(userId: string, type: "email" | "phone"): Promise<void> {
        const user = await this.repo.findById(userId)
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" })

        if (type === "email") {
            if (!user.email) throw new HTTPException(400, { message: "Email tidak tersedia" })
            if (user.email_verified) throw new HTTPException(400, { message: "Email sudah terverifikasi" })
        } else {
            if (!user.phone) throw new HTTPException(400, { message: "Nomor telepon tidak tersedia" })
            if (user.phone_verified) throw new HTTPException(400, { message: "Nomor telepon sudah terverifikasi" })
        }

        const code = generateVerificationCode()

        // Store in Redis with TTL (include type in key)
        const redis = await RedisClient.getInstance()
        await redis.setEx(`verify:${type}:${userId}`, VERIFICATION_TTL, code)

        // Send verification code
        if (type === "email") {
            await sendVerificationEmail(user.email!, code)
        } else {
            await sendVerificationSMS(user.phone!, code)
        }
    }

    async verifyAccount(userId: string, code: string, type: "email" | "phone"): Promise<void> {
        const user = await this.repo.findById(userId)
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" })

        if (type === "email" && user.email_verified) {
            throw new HTTPException(400, { message: "Email sudah terverifikasi" })
        }
        if (type === "phone" && user.phone_verified) {
            throw new HTTPException(400, { message: "Nomor telepon sudah terverifikasi" })
        }

        const redis = await RedisClient.getInstance()
        const savedCode = await redis.get(`verify:${type}:${userId}`)

        if (!savedCode) {
            throw new HTTPException(400, { message: "Kode verifikasi tidak ditemukan atau sudah kadaluarsa" })
        }
        if (savedCode !== code) {
            throw new HTTPException(400, { message: "Kode verifikasi salah" })
        }

        // Delete code from Redis and mark as verified
        await redis.del(`verify:${type}:${userId}`)
        await this.repo.setVerified(userId, type)
    }

    async login(identifier: string, password: string): Promise<LoginResult> {
        const user = await this.repo.findByIdentifier(identifier)
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" })

        const isValid = await Bun.password.verify(password, user.password)
        if (!isValid) throw new HTTPException(401, { message: "Username/Email dan Password salah" })

        if (!user.is_active) throw new HTTPException(403, { message: "Akun anda belum aktif. Silakan verifikasi terlebih dahulu." })

        let school_id: string | undefined
        if (user.role === "kepala_sekolah") {
            const userSchool = await this.userSchoolRepo.getByUserId(user.id)
            if (!userSchool) throw new HTTPException(404, { message: "User school tidak ditemukan" })
            school_id = userSchool.school_id
        }

        const refresh_token = await JWTHelper.GenerateRefreshToken(user.id)
        const access_token = await JWTHelper.GenerateAccessToken({
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            role: user.role,
            school_id: school_id
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
            user: { id: user.id, full_name: user.full_name, username: user.username, role: user.role }
        }
    }

    async logout(id: string): Promise<void> {
        const redis = await RedisClient.getInstance()
        await redis.del(`refresh:${id}`)
        await redis.del(`access:${id}`)
    }

    async verifyToken(id: string): Promise<boolean> {
        const redis = await RedisClient.getInstance()
        const token = await redis.get(`access:${id}`)
        return !!token
    }

    async refreshToken(token: string): Promise<string> {
        // decode token
        const decoded = decode(token)

        // Cek apakah refresh token ada di redis
        const redis = await RedisClient.getInstance()
        const token_exist = await redis.get(`refresh:${decoded.payload.sub}`)

        // Jika tidak ada, maka return
        if (token != token_exist) throw new HTTPException(401, { message: "Token has been revoked" })

        // Jika ada,
        // Validasi exp refresh token
        const token_verified = await verify(token, Config.REFRESH_SECRET_KEY as string)

        // Jika token expired
        if (!token_verified) throw new HTTPException(401, { message: "Token expired" })

        // Generated access token
        // 1. Get User and check
        const user = await this.repo.findById(decoded.payload.sub as string)
        if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" })

        let school_id: string | undefined
        if (user.role === "kepala_sekolah") {
            const userSchool = await this.userSchoolRepo.getByUserId(user.id)
            if (!userSchool) throw new HTTPException(404, { message: "User school tidak ditemukan" })
            school_id = userSchool.school_id
        }

        // 2. Generate New Access Token
        const access_token = await JWTHelper.GenerateAccessToken({
            id: user.id,
            username: user.username,
            role: user.role,
            full_name: user.full_name,
            school_id: school_id
        })

        // 3. Save new access token into redis (15 minutes in seconds)
        const accessTTL = Config.EXPIRED_ACCESS_TOKEN * 60
        await redis.setEx(`access:${user.id}`, accessTTL, access_token)

        return access_token
    }
}