import { Hono } from "hono";
import { SchoolRoute } from "./module/school/school.route";
import { AuthRoute } from "./module/auth/auth.route";

const appRoute = new Hono()

appRoute.route("/school", SchoolRoute())
appRoute.route("/auth", AuthRoute())

export default appRoute