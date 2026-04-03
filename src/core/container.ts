import { db } from "../config/database";
import { AuthRepository } from "../module/auth/auth.repo";
import { AuthService } from "../module/auth/auth.service";
import { SchoolRepository } from "../module/school/school.repo";
import { SchoolService } from "../module/school/school.service";
import { UserSchoolRepository } from "../module/user_school/user_school.repo";
import { UserSchoolService } from "../module/user_school/user_school.service";
import { TeacherRepository } from "../module/teacher/teacher.repo";
import { TeacherService } from "../module/teacher/teacher.service";
import { ParentRepository } from "../module/parent/parent.repo";
import { ParentService } from "../module/parent/parent.service";
import { StudentRepository } from "../module/student/student.repo";
import { StudentService } from "../module/student/student.service";
import { ClassRepository } from "../module/class/class.repo";
import { ClassService } from "../module/class/class.service";
import { AttendanceRepository } from "../module/attendance/attendance.repo";
import { AttendanceService } from "../module/attendance/attendance.service";
import { GraduationRepository } from "../module/graduation/graduation.repo";
import { GraduationService } from "../module/graduation/graduation.service";
import { SavingsRepository } from "../module/savings/savings.repo";
import { SavingsService } from "../module/savings/savings.service";

// Create authRepo first as it's needed by other repos
const authRepo = new AuthRepository(db)

export const container = {
    schoolRepo: new SchoolRepository(db),
    schoolService: null as unknown as SchoolService,

    authRepo: authRepo,
    authService: null as unknown as AuthService,

    userSchoolRepo: new UserSchoolRepository(db),
    userSchoolService: null as unknown as UserSchoolService,

    teacherRepo: new TeacherRepository(db, authRepo),
    teacherService: null as unknown as TeacherService,

    parentRepo: new ParentRepository(db, authRepo),
    parentService: null as unknown as ParentService,

    studentRepo: new StudentRepository(db),
    studentService: null as unknown as StudentService,

    classRepo: new ClassRepository(db),
    classService: null as unknown as ClassService,

    attendanceRepo: new AttendanceRepository(db),
    attendanceService: null as unknown as AttendanceService,

    graduationRepo: new GraduationRepository(db),
    graduationService: null as unknown as GraduationService,

    savingsRepo: new SavingsRepository(db),
    savingsService: null as unknown as SavingsService,
}

container.schoolService = new SchoolService(container.schoolRepo)
container.authService = new AuthService(container.authRepo, container.userSchoolRepo)
container.userSchoolService = new UserSchoolService(container.userSchoolRepo)
container.teacherService = new TeacherService(container.teacherRepo)
container.parentService = new ParentService(container.parentRepo)
container.studentService = new StudentService(container.studentRepo)
container.classService = new ClassService(container.classRepo)
container.attendanceService = new AttendanceService(container.attendanceRepo)
container.graduationService = new GraduationService(container.graduationRepo)
container.savingsService = new SavingsService(container.savingsRepo)