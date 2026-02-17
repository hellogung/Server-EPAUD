import { CreateUserSchool, UserSchool } from "../../db/user_school.schema"

export interface IUserSchoolRepository {
    create(data: CreateUserSchool): Promise<UserSchool>
}
