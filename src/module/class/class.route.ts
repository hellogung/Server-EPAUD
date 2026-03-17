import {Hono} from "hono";
import {container} from "../../core/container";
import {ClassController} from "./class.controller"
import AuthMiddleware from "../auth/auth.middleware";

export const ClassRoute = () => {
    const app = new Hono()
    const c = ClassController(container.classService)

    // Protected routes - requires authentication
    app.post("/", AuthMiddleware.check, c.create)
    app.get("/", c.getAll)
    app.get("/:id", AuthMiddleware.check, c.getById)
    app.put("/:id", AuthMiddleware.check, c.update)
    app.delete("/:id", AuthMiddleware.check, c.delete)

    // Teacher assignments
    app.post("/:id/teachers", AuthMiddleware.check, c.assignTeacher)
    app.post("/:id/teachers/bulk", AuthMiddleware.check, c.bulkAssignTeachers)
    app.get("/:id/teachers", AuthMiddleware.check, c.getTeachers)
    app.delete("/:id/teachers/:teacherId", AuthMiddleware.check, c.removeTeacher)

    // Student assignments
    app.post("/:id/students", AuthMiddleware.check, c.assignStudent)
    app.post("/:id/students/bulk", AuthMiddleware.check, c.bulkAssignStudents)
    app.get("/:id/students", AuthMiddleware.check, c.getStudents)
    app.delete("/:id/students/:studentId", AuthMiddleware.check, c.removeStudent)

    return app
}
