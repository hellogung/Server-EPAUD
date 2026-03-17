import {Hono} from "hono";
import {container} from "../../core/container";
import {GraduationController} from "./graduation.controller";
import AuthMiddleware from "../auth/auth.middleware";

export const GraduationRoute = () => {
    const app = new Hono()
    const c = GraduationController(container.graduationService)

    app.post("/", AuthMiddleware.check, c.create)
    app.get("/", c.getAll)
    app.get("/:id", AuthMiddleware.check, c.getById)
    app.put("/:id", AuthMiddleware.check, c.update)
    app.delete("/:id", AuthMiddleware.check, c.delete)

    return app
}
