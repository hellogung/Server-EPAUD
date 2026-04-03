import { eq } from "drizzle-orm"
import { db } from "../../config/database"
import { CreateUserSchool, UserSchool, UserSchoolSchema } from "../../db/user_school.schema"
import { IUserSchoolRepository } from "./IUserSchoolRepository"

export class UserSchoolRepository implements IUserSchoolRepository {
    constructor(private readonly DBClient = db) { }

    async create(data: CreateUserSchool): Promise<UserSchool> {
        const [record] = await this.DBClient.insert(UserSchoolSchema).values(data).returning()
        return record
    }
    async getByUserId(user_id: string): Promise<UserSchool | null> {
        const [record] = await this.DBClient.select().from(UserSchoolSchema).where(eq(UserSchoolSchema.user_id, user_id))
        return record
    }
}
