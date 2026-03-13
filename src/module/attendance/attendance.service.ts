import {IAttendanceRepository, CreateAttendanceUserInput, CreateScheduleInput, UpdateScheduleInput} from "./IAttendanceRepository";
import {Attendance, AttendanceUser, AttendanceSchema, ScheduleAttendanceSchool} from "../../db/attendance.schema";
import {eq, and, gte, lte} from "drizzle-orm";
import {HTTPException} from "hono/http-exception";

type GetAttendancesParams = {
    attendance_id?: string
    date_from?: string
    date_to?: string
    limit: number
    offset: number
}

export class AttendanceService {
    constructor(private readonly repo: IAttendanceRepository) {}

    // ─── Attendance Users ─────────────────────────────────────────────────────────
    async registerAttendanceUser(data: CreateAttendanceUserInput): Promise<AttendanceUser> {
        // Check if attendance_user_id already exists
        const existing = await this.repo.findAttendanceUserById(data.attendance_user_id)
        if (existing) throw new HTTPException(400, {message: "ID absensi sudah terdaftar"})
        
        return await this.repo.createAttendanceUser(data)
    }

    async getAttendanceUserById(attendanceUserId: string): Promise<AttendanceUser> {
        const user = await this.repo.findAttendanceUserById(attendanceUserId)
        if (!user) throw new HTTPException(404, {message: "User absensi tidak ditemukan"})
        return user
    }

    async deleteAttendanceUser(id: string): Promise<void> {
        await this.repo.deleteAttendanceUser(id)
    }

    // ─── Attendance Records ───────────────────────────────────────────────────────
    async getAttendances({
        attendance_id,
        date_from,
        date_to,
        limit,
        offset,
    }: GetAttendancesParams): Promise<{data: Attendance[], total: {count: number}}> {
        const conditions = []
        
        if (attendance_id) {
            conditions.push(eq(AttendanceSchema.attendance_id, attendance_id))
        }
        if (date_from) {
            conditions.push(gte(AttendanceSchema.datetime_in, new Date(date_from)))
        }
        if (date_to) {
            conditions.push(lte(AttendanceSchema.datetime_in, new Date(date_to)))
        }

        const condition = conditions.length > 0 ? and(...conditions) : undefined

        return await this.repo.getAttendances({condition, limit, offset})
    }

    async findAttendanceById(id: string): Promise<Attendance> {
        const attendance = await this.repo.findAttendanceById(id)
        if (!attendance) throw new HTTPException(404, {message: "Data absensi tidak ditemukan"})
        return attendance
    }

    async deleteAttendance(id: string): Promise<void> {
        await this.findAttendanceById(id)
        await this.repo.deleteAttendance(id)
    }

    // ─── Check-in/Check-out ───────────────────────────────────────────────────────
    async checkIn(attendanceUserId: string): Promise<Attendance> {
        // Verify user exists
        await this.getAttendanceUserById(attendanceUserId)
        return await this.repo.checkIn(attendanceUserId)
    }

    async checkOut(id: string): Promise<Attendance> {
        const attendance = await this.findAttendanceById(id)
        if (attendance.datetime_out) {
            throw new HTTPException(400, {message: "Sudah melakukan check-out"})
        }
        return await this.repo.checkOut(id)
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────────
    async createSchedule(data: CreateScheduleInput): Promise<ScheduleAttendanceSchool> {
        return await this.repo.createSchedule(data)
    }

    async getSchedulesBySchoolId(schoolId: string): Promise<ScheduleAttendanceSchool[]> {
        return await this.repo.getSchedulesBySchoolId(schoolId)
    }

    async findScheduleById(id: string): Promise<ScheduleAttendanceSchool> {
        const schedule = await this.repo.findScheduleById(id)
        if (!schedule) throw new HTTPException(404, {message: "Jadwal tidak ditemukan"})
        return schedule
    }

    async updateSchedule(id: string, data: UpdateScheduleInput): Promise<ScheduleAttendanceSchool> {
        await this.findScheduleById(id)
        return await this.repo.updateSchedule(id, data)
    }

    async deleteSchedule(id: string): Promise<void> {
        await this.findScheduleById(id)
        await this.repo.deleteSchedule(id)
    }
}
