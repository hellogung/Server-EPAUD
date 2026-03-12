import {Hono} from "hono";
import {container} from "../../core/container";
import {ParentController} from "./parent.controller"
import AuthMiddleware from "../auth/auth.middleware";

export const ParentRoute = () => {
    const app = new Hono()
    const c = ParentController(container.parentService)

    // Protected routes - requires authentication
    app.post("/", AuthMiddleware.check, c.create)
    app.get("/", AuthMiddleware.check, c.getAll)
    app.get("/:id", AuthMiddleware.check, c.getById)
    app.put("/:id", AuthMiddleware.check, c.update)
    app.delete("/:id", AuthMiddleware.check, c.delete)

    return app
}
