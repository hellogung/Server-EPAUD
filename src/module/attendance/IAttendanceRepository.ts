import {Attendance, AttendanceUser, ScheduleAttendanceSchool} from "../../db/attendance.schema";
import type {SQL} from "drizzle-orm";

export type CreateAttendanceUserInput = {
    attendance_user_id: string
    teacher_id?: string
    student_id?: string
}

export type CreateAttendanceInput = {
    attendance_id: string
    datetime_in?: Date
    datetime_out?: Date
}

export type UpdateAttendanceInput = {
    datetime_in?: Date
    datetime_out?: Date
}

export type CreateScheduleInput = {
    school_id: string
    type: "teacher" | "student"
    day: string
    in: string
    out: string
}

export type UpdateScheduleInput = {
    day?: string
    in?: string
    out?: string
}

export interface IAttendanceRepository {
    // Attendance Users (registration for attendance ID)
    createAttendanceUser(data: CreateAttendanceUserInput): Promise<AttendanceUser>
    findAttendanceUserById(attendanceUserId: string): Promise<AttendanceUser | null>
    findAttendanceUserByTeacherId(teacherId: string): Promise<AttendanceUser | null>
    findAttendanceUserByStudentId(studentId: string): Promise<AttendanceUser | null>
    deleteAttendanceUser(id: string): Promise<void>

    // Attendance records
    createAttendance(data: CreateAttendanceInput): Promise<Attendance>
    getAttendances(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Attendance[], total: {count: number}}>
    findAttendanceById(id: string): Promise<Attendance | null>
    updateAttendance(id: string, data: UpdateAttendanceInput): Promise<Attendance>
    deleteAttendance(id: string): Promise<void>
    
    // Check-in/Check-out
    checkIn(attendanceId: string): Promise<Attendance>
    checkOut(id: string): Promise<Attendance>

    // Schedule
    createSchedule(data: CreateScheduleInput): Promise<ScheduleAttendanceSchool>
    getSchedulesBySchoolId(schoolId: string): Promise<ScheduleAttendanceSchool[]>
    findScheduleById(id: string): Promise<ScheduleAttendanceSchool | null>
    updateSchedule(id: string, data: UpdateScheduleInput): Promise<ScheduleAttendanceSchool>
    deleteSchedule(id: string): Promise<void>
}
