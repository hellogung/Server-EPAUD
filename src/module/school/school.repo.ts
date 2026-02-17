import { eq } from "drizzle-orm"
import { db } from "../../config/database"
import { CreateSchool, School, SchoolSchema } from "../../db/school.schema"
import { ISchoolRepository, UpdateSchoolData } from "./ISchoolRepository"

export class SchoolRepository implements ISchoolRepository {
    constructor(private readonly DBClient = db) {}

    async create(data: CreateSchool): Promise<School> {
        const [school] = await this.DBClient.insert(SchoolSchema).values(data).returning()
        return school
    }

    async findById(id: string): Promise<School | null> {
        const [school] = await this.DBClient.select().from(SchoolSchema).where(eq(SchoolSchema.id, id))
        return school || null
    }

    async update(id: string, data: UpdateSchoolData): Promise<School> {
        const [school] = await this.DBClient.update(SchoolSchema)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(SchoolSchema.id, id))
            .returning()
        return school
    }
}