import { Hono } from "hono"
import { AuthController } from "./auth.controller"
import { container } from "../../core/container"
import AuthMiddleware from "./auth.middleware"

export const AuthRoute = () => {
    const app = new Hono()

    const controller = AuthController(container.authService)

    app.post("register", controller.register)
    app.post("login", controller.login)
    app.post("refresh", controller.refresh_token)

    app.get("profile", AuthMiddleware.check ,controller.profile)

    return app
}