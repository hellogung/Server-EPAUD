import {Hono} from "hono";
import {container} from "../../core/container";
import {AttendanceController} from "./attendance.controller";
import AuthMiddleware from "../auth/auth.middleware";

export const AttendanceRoute = () => {
    const app = new Hono()
    const c = AttendanceController(container.attendanceService)

    // Attendance Users
    app.post("/users", AuthMiddleware.check, c.registerUser)
    app.get("/users/:attendanceUserId", AuthMiddleware.check, c.getUserById)
    app.delete("/users/:id", AuthMiddleware.check, c.deleteUser)

    // Attendance Records
    app.get("/", AuthMiddleware.check, c.getAttendances)
    app.get("/:id", AuthMiddleware.check, c.getAttendanceById)
    app.delete("/:id", AuthMiddleware.check, c.deleteAttendance)

    // Check-in/Check-out
    app.post("/check-in", AuthMiddleware.check, c.checkIn)
    app.put("/check-out/:id", AuthMiddleware.check, c.checkOut)

    // Schedule
    app.post("/schedules", AuthMiddleware.check, c.createSchedule)
    app.get("/schedules/school/:schoolId", AuthMiddleware.check, c.getSchedulesBySchool)
    app.get("/schedules/:id", AuthMiddleware.check, c.getScheduleById)
    app.put("/schedules/:id", AuthMiddleware.check, c.updateSchedule)
    app.delete("/schedules/:id", AuthMiddleware.check, c.deleteSchedule)

    return app
}
