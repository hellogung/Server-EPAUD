import { and, eq, ne, sql, SQL } from "drizzle-orm"
import { db } from "../../config/database"
import { CreateSchool, School, SchoolSchema } from "../../db/school.schema"
import { ISchoolRepository, UpdateSchoolData } from "./ISchoolRepository"
import { HTTPException } from "hono/http-exception"

export class SchoolRepository implements ISchoolRepository {
    constructor(private readonly DBClient = db) { }

    async create(data: CreateSchool): Promise<School> {
        const existingSchool = await this.DBClient.select().from(SchoolSchema).where(eq(SchoolSchema.school_name, data.school_name))

        if (existingSchool.length > 0) {
            throw new HTTPException(400, { message: `Sekolah dengan nama "${data.school_name}" sudah ada` })
        }

        const [school] = await this.DBClient.insert(SchoolSchema).values(data).returning()
        return school
    }

    async getAll({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: School[], total: {count: number}}> {
        const schools = await this.DBClient
            .select()
            .from(SchoolSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(SchoolSchema)
            .where(condition)

        return {data: schools, total: totalResult}
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