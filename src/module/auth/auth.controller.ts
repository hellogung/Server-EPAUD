import { Context } from "hono";
import { AuthValidator } from "./auth.validator";
import { AuthService } from "./auth.service";
import { SchoolService } from "../school/school.service";
import { UserSchoolService } from "../user_school/user_school.service";
import { HTTPException } from "hono/http-exception";
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { Config } from "../../config";
import {handleError} from "../../helper/handleError";

export const AuthController = (
    service: AuthService,
    schoolService: SchoolService,
    userSchoolService: UserSchoolService,
) => ({
    register: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = AuthValidator.register().parse(body)

            const school = await schoolService.create({ school_name: data.nama_sekolah })
            const username = data.email || data.phone!


            const user = await service.register({
                full_name: data.nama_kepala_sekolah,
                username,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: "user",
            })

            await userSchoolService.create({
                user_id: user.id,
                school_id: school.id,
                role: "kepala_sekolah",
            })

            // Auto-send verification (prioritize email, fallback to phone)
            const verificationType = data.email ? "email" : "phone"
            await service.sendVerification(user.id, verificationType)

            return c.json({
                message: "Registrasi berhasil. Silakan verifikasi akun Anda.",
                data: { user_id: user.id, school_id: school.id, verification_type: verificationType }
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    sendVerification: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { user_id, type } = AuthValidator.sendVerification().parse(body)
            await service.sendVerification(user_id, type)
            return c.json({ message: `Kode verifikasi telah dikirim ke ${type}` })
        } catch (error) {
            return handleError(c, error)
        }
    },

    verify: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { user_id, code, type } = AuthValidator.verify().parse(body)
            await service.verifyAccount(user_id, code, type)
            return c.json({ message: `${type === "email" ? "Email" : "Nomor telepon"} berhasil diverifikasi` })
        } catch (error) {
            return handleError(c, error)
        }
    },

    login: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { identifier, password } = AuthValidator.login().parse(body)
            const result = await service.login(identifier, password)

            setCookie(c, "refresh_token", result.refresh_token, {
                httpOnly: true,
                secure: Config.IS_PRODUCTION,
                path: "/api/auth/refresh",
                maxAge: 15 * 24 * 60 * 60 // 15 days
            })

            return c.json({
                message: "Login berhasil",
                data: { access_token: result.access_token, user: result.user }
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    logout: async (c: Context) => {
        try {
            const { id } = c.get("user")
            await service.logout(id)
            deleteCookie(c, "refresh_token")
            return c.json({ message: "Logout berhasil" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    verifyAccessToken: async (c: Context) => {
        try {
            const { id } = c.get("user")
            const valid = await service.verifyToken(id)
            if (!valid) return c.json({ message: "Token invalid" }, 401)
            return c.json({ valid: true })
        } catch (error) {
            return handleError(c, error)
        }
    },

    refreshToken: async (c: Context) => {
        try {
            const token = getCookie(c, "refresh_token")

            if (!token) return c.json({ message: "No token found" }, 401)

            const access_token = await service.refreshToken(token)

            return c.json({ access_token })
        } catch (error) {
            return handleError(c, error)
        }
    },

    profile: async (c: Context) => {
        try {
            const user = c.get("user")
            if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" })
            return c.json({ data: user })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getAll: async (c: Context) => {
        const { search, role, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const users = await service.getAll({
                search,
                role,
                limit: limitNumber,
                offset,
                page: pageNumber,
            })

            const total = Number(users.total.count)

            return c.json({
                data: users.data,
                meta: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber),
                },
            }, 200)
        } catch (error) {
            return handleError(c, error)
        }
    }
})