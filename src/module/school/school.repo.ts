import { db } from "../../config/database"
import { CreateSchool, School, SchoolSchema } from "../../db/schema"
import { ISchoolRepository } from "./ISchoolRepository"

export class SchoolRepository implements ISchoolRepository {
    constructor(private readonly DBClient = db) {}

    async create(data: CreateSchool): Promise<School> {
        const [school] = await this.DBClient.insert(SchoolSchema).values(data).returning()
        return school
    }
}