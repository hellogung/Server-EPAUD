import {db} from "../../config/database";
import {CreateTeacher, Teacher, TeacherSchema} from "../../db/teacher.schema";
import {sql, SQL} from "drizzle-orm";

export class TeacherRepository {
    constructor(private  readonly DBClient = db) {
    }

    async create(data: CreateTeacher): Promise<Teacher> {
        const [teacher] = await this.DBClient.insert(TeacherSchema).values(data).returning()
        return teacher
    }

    async getAll({limit, offset, condition} : {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Teacher[], total: {count: number}}> {
        const teachers = await this.DBClient
            .select()
            .from(TeacherSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(TeacherSchema)
            .where(condition)

        return {data: teachers, total: totalResult}
    }
}