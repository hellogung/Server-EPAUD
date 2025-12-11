import { Hono } from "hono"
import { AuthController } from "./auth.controller"
import { container } from "../../core/container"
import AuthMiddleware from "./auth.middleware"

export const AuthRoute = () => {
    const app = new Hono()

    const controller = AuthController(container.authService)

    app.post("register", controller.register)
    app.post("login", controller.login)
    app.get("verify",
        AuthMiddleware.check,
        AuthMiddleware.role("superadmin"),
        controller.verify)
    // app.get("profile/:id", controller.profile)

    return app
}