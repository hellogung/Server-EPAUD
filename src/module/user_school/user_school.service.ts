import { CreateUserSchool, UserSchool } from "../../db/user_school.schema"
import { IUserSchoolRepository } from "./IUserSchoolRepository"

export class UserSchoolService {
    constructor(private readonly repo: IUserSchoolRepository) {}

    async create(data: CreateUserSchool): Promise<UserSchool> {
        return await this.repo.create(data)
    }
}
