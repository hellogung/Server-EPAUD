import {db} from "../../config/database";
import {Student, StudentSchema} from "../../db/student.schema";
import {eq, sql, SQL} from "drizzle-orm";
import {IStudentRepository, UpdateStudentData, CreateStudentData} from "./IStudentRepository";

export class StudentRepository implements IStudentRepository {
    constructor(private readonly DBClient = db) {
    }

    async create(data: CreateStudentData): Promise<Student> {
        const [student] = await this.DBClient.insert(StudentSchema).values(data).returning()
        return student
    }

    async getAll({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Student[], total: {count: number}}> {
        const students = await this.DBClient
            .select()
            .from(StudentSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(StudentSchema)
            .where(condition)

        return {data: students, total: totalResult}
    }

    async findById(id: string): Promise<Student | null> {
        const [student] = await this.DBClient
            .select()
            .from(StudentSchema)
            .where(eq(StudentSchema.id, id))
        return student || null
    }

    async findByParentId(parentId: string): Promise<Student[]> {
        return await this.DBClient
            .select()
            .from(StudentSchema)
            .where(eq(StudentSchema.parent_id, parentId))
    }

    async update(id: string, data: UpdateStudentData): Promise<Student> {
        const [student] = await this.DBClient
            .update(StudentSchema)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(StudentSchema.id, id))
            .returning()
        return student
    }

    async delete(id: string): Promise<void> {
        await this.DBClient
            .delete(StudentSchema)
            .where(eq(StudentSchema.id, id))
    }
}
