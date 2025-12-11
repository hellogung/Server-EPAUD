import { db } from "../config/database";
import { AuthRepository } from "../module/auth/auth.repo";
import { AuthService } from "../module/auth/auth.service";
import { SchoolRepository } from "../module/school/school.repo";
import { SchoolService } from "../module/school/school.service";

export const container = {
    schoolRepo: new SchoolRepository(db),
    schoolService: null as unknown as SchoolService,

    authRepo: new AuthRepository(db),
    authService: null as unknown as AuthService
}

container.schoolService = new SchoolService(container.schoolRepo)
container.authService = new AuthService(container.authRepo)