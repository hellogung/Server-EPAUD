import { db } from "../../config/database"
import { CreateUserSchool, UserSchool, UserSchoolSchema } from "../../db/user_school.schema"
import { IUserSchoolRepository } from "./IUserSchoolRepository"

export class UserSchoolRepository implements IUserSchoolRepository {
    constructor(private readonly DBClient = db) {}

    async create(data: CreateUserSchool): Promise<UserSchool> {
        const [record] = await this.DBClient.insert(UserSchoolSchema).values(data).returning()
        return record
    }
}
