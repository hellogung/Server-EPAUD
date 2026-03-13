import { Hono } from "hono";
import { SchoolRoute } from "./module/school/school.route";
import { AuthRoute } from "./module/auth/auth.route";
import {TeacherRoute} from "./module/teacher/teacher.route";
import {ParentRoute} from "./module/parent/parent.route";
import {StudentRoute} from "./module/student/student.route";
import {ClassRoute} from "./module/class/class.route";
import {AttendanceRoute} from "./module/attendance/attendance.route";
import {GraduationRoute} from "./module/graduation/graduation.route";
import {SavingsRoute} from "./module/savings/savings.route";

const appRoute = new Hono()

appRoute.route("/auth", AuthRoute())
appRoute.route("/school", SchoolRoute())
appRoute.route("/teacher", TeacherRoute())
appRoute.route("/parent", ParentRoute())
appRoute.route("/student", StudentRoute())
appRoute.route("/class", ClassRoute())
appRoute.route("/attendance", AttendanceRoute())
appRoute.route("/graduation", GraduationRoute())
appRoute.route("/savings", SavingsRoute())

export default appRoute