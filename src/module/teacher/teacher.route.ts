import {Hono} from "hono";
import {container} from "../../core/container";
import {TeacherController} from "./teacher.controller"
import AuthMiddleware from "../auth/auth.middleware";

export const TeacherRoute = () => {
    const app = new Hono()
    const c = TeacherController(container.teacherService)

    // Protected routes - requires authentication
    app.post("/", AuthMiddleware.check, c.create)

    return app
}