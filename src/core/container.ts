import { db } from "../config/database";
import { AuthRepository } from "../module/auth/auth.repo";
import { AuthService } from "../module/auth/auth.service";
import { SchoolRepository } from "../module/school/school.repo";
import { SchoolService } from "../module/school/school.service";
import { UserSchoolRepository } from "../module/user_school/user_school.repo";
import { UserSchoolService } from "../module/user_school/user_school.service";

export const container = {
    schoolRepo: new SchoolRepository(db),
    schoolService: null as unknown as SchoolService,

    authRepo: new AuthRepository(db),
    authService: null as unknown as AuthService,

    userSchoolRepo: new UserSchoolRepository(db),
    userSchoolService: null as unknown as UserSchoolService,
}

container.schoolService = new SchoolService(container.schoolRepo)
container.authService = new AuthService(container.authRepo)
container.userSchoolService = new UserSchoolService(container.userSchoolRepo)