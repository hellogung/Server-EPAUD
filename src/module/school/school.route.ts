import { Hono } from "hono"
import { SchoolController } from "./school.controller"
import { container } from "../../core/container"
import AuthMiddleware from "../auth/auth.middleware"

export const SchoolRoute = () => {
    const app = new Hono()
    const c = SchoolController(container.schoolService)

    // Protected routes - requires authentication
    app.get("/",  c.getAll)
    app.post("/", AuthMiddleware.check, c.create)
    app.get("/:id", AuthMiddleware.check, c.getById)
    app.patch("/:id", AuthMiddleware.check, c.update)

    return app
}