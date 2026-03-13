import z from "zod";

// Attendance User
export const createAttendanceUserValidation = z.object({
    attendance_user_id: z.string().min(1),
    teacher_id: z.string().uuid().optional(),
    student_id: z.string().uuid().optional(),
}).refine(data => data.teacher_id || data.student_id, {
    message: "Harus mengisi teacher_id atau student_id"
})

// Check-in
export const checkInValidation = z.object({
    attendance_user_id: z.string().min(1),
})

// Schedule
export const createScheduleValidation = z.object({
    school_id: z.string().uuid(),
    type: z.enum(["teacher", "student"]),
    day: z.string().min(1),
    in: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu: HH:mm"),
    out: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu: HH:mm"),
})

export const updateScheduleValidation = z.object({
    day: z.string().min(1).optional(),
    in: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu: HH:mm").optional(),
    out: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu: HH:mm").optional(),
})
