import {AttendanceService} from "./attendance.service";
import {Context} from "hono";
import {createAttendanceUserValidation, checkInValidation, createScheduleValidation, updateScheduleValidation} from "./attendance.validator";
import {handleError} from "../../helper/handleError";

export const AttendanceController = (service: AttendanceService) => ({
    // ─── Attendance Users ─────────────────────────────────────────────────────────
    registerUser: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createAttendanceUserValidation.parse(body)
            const user = await service.registerAttendanceUser(data)
            return c.json({
                message: "User absensi berhasil didaftarkan",
                data: user
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    getUserById: async (c: Context) => {
        try {
            const attendanceUserId = c.req.param("attendanceUserId")
            const user = await service.getAttendanceUserById(attendanceUserId)
            return c.json({ data: user })
        } catch (error) {
            return handleError(c, error)
        }
    },

    deleteUser: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.deleteAttendanceUser(id)
            return c.json({ message: "User absensi berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    // ─── Attendance Records ───────────────────────────────────────────────────────
    getAttendances: async (c: Context) => {
        const { attendance_id, date_from, date_to, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const result = await service.getAttendances({
                attendance_id,
                date_from,
                date_to,
                limit: limitNumber,
                offset,
            })

            const total = Number(result.total.count)

            return c.json({
                data: result.data,
                meta: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber),
                },
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getAttendanceById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const attendance = await service.findAttendanceById(id)
            return c.json({ data: attendance })
        } catch (error) {
            return handleError(c, error)
        }
    },

    deleteAttendance: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.deleteAttendance(id)
            return c.json({ message: "Data absensi berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    // ─── Check-in/Check-out ───────────────────────────────────────────────────────
    checkIn: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { attendance_user_id } = checkInValidation.parse(body)
            const attendance = await service.checkIn(attendance_user_id)
            return c.json({
                message: "Check-in berhasil",
                data: attendance
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    checkOut: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const attendance = await service.checkOut(id)
            return c.json({
                message: "Check-out berhasil",
                data: attendance
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    // ─── Schedule ─────────────────────────────────────────────────────────────────
    createSchedule: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createScheduleValidation.parse(body)
            const schedule = await service.createSchedule(data)
            return c.json({
                message: "Jadwal absensi berhasil ditambahkan",
                data: schedule
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    getSchedulesBySchool: async (c: Context) => {
        try {
            const schoolId = c.req.param("schoolId")
            const schedules = await service.getSchedulesBySchoolId(schoolId)
            return c.json({ data: schedules })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getScheduleById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const schedule = await service.findScheduleById(id)
            return c.json({ data: schedule })
        } catch (error) {
            return handleError(c, error)
        }
    },

    updateSchedule: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const body = await c.req.json()
            const data = updateScheduleValidation.parse(body)
            const schedule = await service.updateSchedule(id, data)
            return c.json({
                message: "Jadwal absensi berhasil diperbarui",
                data: schedule
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    deleteSchedule: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.deleteSchedule(id)
            return c.json({ message: "Jadwal absensi berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    }
})
