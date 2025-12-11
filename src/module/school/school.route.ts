import { Hono } from "hono"
import { SchoolController } from "./school.controller"
import { container } from "../../core/container"

export const SchoolRoute = () => {
    const app = new Hono()

    const controller = SchoolController(container.schoolService)

    app.post("/", controller.create)

    return app
}