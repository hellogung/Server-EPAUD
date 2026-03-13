import {db} from "../../config/database";
import {Attendance, AttendanceSchema, AttendanceUser, AttendanceUserSchema, ScheduleAttendanceSchool, ScheduleAttendanceSchoolSchema} from "../../db/attendance.schema";
import {eq, sql, SQL} from "drizzle-orm";
import {IAttendanceRepository, CreateAttendanceUserInput, CreateAttendanceInput, UpdateAttendanceInput, CreateScheduleInput, UpdateScheduleInput} from "./IAttendanceRepository";

export class AttendanceRepository implements IAttendanceRepository {
    constructor(private readonly DBClient = db) {}

    // ─── Attendance Users ─────────────────────────────────────────────────────────
    async createAttendanceUser(data: CreateAttendanceUserInput): Promise<AttendanceUser> {
        const [user] = await this.DBClient.insert(AttendanceUserSchema).values(data).returning()
        return user
    }

    async findAttendanceUserById(attendanceUserId: string): Promise<AttendanceUser | null> {
        const [user] = await this.DBClient
            .select()
            .from(AttendanceUserSchema)
            .where(eq(AttendanceUserSchema.attendance_user_id, attendanceUserId))
        return user || null
    }

    async findAttendanceUserByTeacherId(teacherId: string): Promise<AttendanceUser | null> {
        const [user] = await this.DBClient
            .select()
            .from(AttendanceUserSchema)
            .where(eq(AttendanceUserSchema.teacher_id, teacherId))
        return user || null
    }

    async findAttendanceUserByStudentId(studentId: string): Promise<AttendanceUser | null> {
        const [user] = await this.DBClient
            .select()
            .from(AttendanceUserSchema)
            .where(eq(AttendanceUserSchema.student_id, studentId))
        return user || null
    }

    async deleteAttendanceUser(id: string): Promise<void> {
        await this.DBClient.delete(AttendanceUserSchema).where(eq(AttendanceUserSchema.id, id))
    }

    // ─── Attendance Records ───────────────────────────────────────────────────────
    async createAttendance(data: CreateAttendanceInput): Promise<Attendance> {
        const [attendance] = await this.DBClient.insert(AttendanceSchema).values(data).returning()
        return attendance
    }

    async getAttendances({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Attendance[], total: {count: number}}> {
        const attendances = await this.DBClient
            .select()
            .from(AttendanceSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(AttendanceSchema)
            .where(condition)

        return {data: attendances, total: totalResult}
    }

    async findAttendanceById(id: string): Promise<Attendance | null> {
        const [attendance] = await this.DBClient
            .select()
            .from(AttendanceSchema)
            .where(eq(AttendanceSchema.id, id))
        return attendance || null
    }

    async updateAttendance(id: string, data: UpdateAttendanceInput): Promise<Attendance> {
        const [attendance] = await this.DBClient
            .update(AttendanceSchema)
            .set(data)
            .where(eq(AttendanceSchema.id, id))
            .returning()
        return attendance
    }

    async deleteAttendance(id: string): Promise<void> {
        await this.DBClient.delete(AttendanceSchema).where(eq(AttendanceSchema.id, id))
    }

    // ─── Check-in/Check-out ───────────────────────────────────────────────────────
    async checkIn(attendanceId: string): Promise<Attendance> {
        const [attendance] = await this.DBClient
            .insert(AttendanceSchema)
            .values({
                attendance_id: attendanceId,
                datetime_in: new Date()
            })
            .returning()
        return attendance
    }

    async checkOut(id: string): Promise<Attendance> {
        const [attendance] = await this.DBClient
            .update(AttendanceSchema)
            .set({ datetime_out: new Date() })
            .where(eq(AttendanceSchema.id, id))
            .returning()
        return attendance
    }

    // ─── Schedule ─────────────────────────────────────────────────────────────────
    async createSchedule(data: CreateScheduleInput): Promise<ScheduleAttendanceSchool> {
        const [schedule] = await this.DBClient.insert(ScheduleAttendanceSchoolSchema).values(data).returning()
        return schedule
    }

    async getSchedulesBySchoolId(schoolId: string): Promise<ScheduleAttendanceSchool[]> {
        return await this.DBClient
            .select()
            .from(ScheduleAttendanceSchoolSchema)
            .where(eq(ScheduleAttendanceSchoolSchema.school_id, schoolId))
    }

    async findScheduleById(id: string): Promise<ScheduleAttendanceSchool | null> {
        const [schedule] = await this.DBClient
            .select()
            .from(ScheduleAttendanceSchoolSchema)
            .where(eq(ScheduleAttendanceSchoolSchema.id, id))
        return schedule || null
    }

    async updateSchedule(id: string, data: UpdateScheduleInput): Promise<ScheduleAttendanceSchool> {
        const [schedule] = await this.DBClient
            .update(ScheduleAttendanceSchoolSchema)
            .set(data)
            .where(eq(ScheduleAttendanceSchoolSchema.id, id))
            .returning()
        return schedule
    }

    async deleteSchedule(id: string): Promise<void> {
        await this.DBClient.delete(ScheduleAttendanceSchoolSchema).where(eq(ScheduleAttendanceSchoolSchema.id, id))
    }
}
