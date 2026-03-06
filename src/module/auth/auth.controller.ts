import { Context } from "hono";
import { AuthValidator } from "./auth.validator";
import { AuthService } from "./auth.service";
import { SchoolService } from "../school/school.service";
import { UserSchoolService } from "../user_school/user_school.service";
import { HTTPException } from "hono/http-exception";
import { deleteCookie, getCookie, setCookie } from "hono/cookie"
import { Config } from "../../config";

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

            // Auto-send verification
            await service.sendVerification(user.id)

            return c.json({
                message: "Registrasi berhasil. Silakan verifikasi akun Anda.",
                data: { user_id: user.id, school_id: school.id }
            }, 201)
        } catch (error) {
            return c.json({message: error})
        }
    },

    sendVerification: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { user_id } = AuthValidator.sendVerification().parse(body)
            await service.sendVerification(user_id)
            return c.json({ message: "Kode verifikasi telah dikirim" })
        } catch (error) {
            return c.json({message: error})
        }
    },

    verify: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { user_id, code } = AuthValidator.verify().parse(body)
            await service.verifyAccount(user_id, code)
            return c.json({ message: "Akun berhasil diverifikasi" })
        } catch (error) {
            return c.json({message: error})
        }
    },

    login: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { identifier, password } = AuthValidator.login().parse(body)
            const result = await service.login(identifier, password)
            console.log(body)

            setCookie(c, "refresh_token", result.refresh_token, {
                httpOnly: true,
                secure: Config.IS_PRODUCTION,
                path: "/api/auth/refresh",
                maxAge: 15 * 24 * 60 * 60
            })

            return c.json({
                message: "Login berhasil",
                data: { access_token: result.access_token, user: result.user }
            })
        } catch (error) {
            return c.json({message: error})
        }
    },

    logout: async (c: Context) => {
        try {
            const { id } = c.get("user")
            await service.logout(id)
            deleteCookie(c, "refresh_token")
            return c.json({ message: "Logout berhasil" })
        } catch (error) {
            return c.json({message: error})
        }
    },

    verifyAccessToken: async (c: Context) => {
        try {
            const { id } = c.get("user")
            const valid = await service.verifyToken(id)
            if (!valid) return c.json({ message: "Token invalid" }, 401)
            return c.json({ valid: true })
        } catch (error) {
            return c.json({message: error})
        }
    },

    refreshToken: async (c: Context) => {
        try {
            const token = getCookie(c, "refresh_token")
            console.log(token)
            if (!token) return c.json({ message: "Unauthenticated" }, 401)
            const access_token = await service.refreshToken(token)
            return c.json({ access_token })
        } catch (error) {
            return c.json({message: error})
        }
    },

    profile: async (c: Context) => {
        try {
            const user = c.get("user")
            if (!user) throw new HTTPException(404, { message: "User tidak ditemukan" })
            return c.json({ data: user })
        } catch (error) {
            return c.json({message: error})
        }
    }
})