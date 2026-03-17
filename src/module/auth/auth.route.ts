import { Hono } from "hono"
import { AuthController } from "./auth.controller"
import { container } from "../../core/container"
import AuthMiddleware from "./auth.middleware"

export const AuthRoute = () => {
    const app = new Hono()
    const c = AuthController(container.authService, container.schoolService, container.userSchoolService)

    // Public routes
    app.post("/register", c.register)
    app.post("/send-verification", c.sendVerification)
    app.post("/verify", c.verify)
    app.post("/login", c.login)
    app.post("/refresh", c.refreshToken)

    // Protected routes
    app.delete("/logout", AuthMiddleware.check, c.logout)
    app.get("/verify-token", AuthMiddleware.check, c.verifyAccessToken)
    app.get("/profile", AuthMiddleware.check, c.profile)
    app.get("/users",  c.getAll)

    return app
}