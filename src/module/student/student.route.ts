import {Hono} from "hono";
import {container} from "../../core/container";
import {StudentController} from "./student.controller"
import AuthMiddleware from "../auth/auth.middleware";

export const StudentRoute = () => {
    const app = new Hono()
    const c = StudentController(container.studentService)

    // Protected routes - requires authentication
    app.post("/", AuthMiddleware.check, c.create)
    app.get("/", AuthMiddleware.check, c.getAll)
    app.get("/:id", AuthMiddleware.check, c.getById)
    app.get("/parent/:parentId", AuthMiddleware.check, c.getByParentId)
    app.put("/:id", AuthMiddleware.check, c.update)
    app.delete("/:id", AuthMiddleware.check, c.delete)

    return app
}
