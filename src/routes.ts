import { Hono } from "hono";
import { SchoolRoute } from "./module/school/school.route";
import { AuthRoute } from "./module/auth/auth.route";
import {TeacherRoute} from "./module/teacher/teacher.route";

const appRoute = new Hono()

appRoute.route("/auth", AuthRoute())
appRoute.route("/school", SchoolRoute())
appRoute.route("/teacher", TeacherRoute())

export default appRoute