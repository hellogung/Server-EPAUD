import {db} from "../../config/database";
import {Graduation, GraduationSchema} from "../../db/graduation.schema";
import {and, eq, sql, SQL} from "drizzle-orm";
import {IGraduationRepository, CreateGraduationInput, UpdateGraduationInput} from "./IGraduationRepository";

export class GraduationRepository implements IGraduationRepository {
    constructor(private readonly DBClient = db) {}

    async create(data: CreateGraduationInput): Promise<Graduation> {
        const [graduation] = await this.DBClient.insert(GraduationSchema).values(data).returning()
        return graduation
    }

    async getAll({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Graduation[], total: {count: number}}> {
        const graduations = await this.DBClient
            .select()
            .from(GraduationSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(GraduationSchema)
            .where(condition)

        return {data: graduations, total: totalResult}
    }

    async findById(id: string): Promise<Graduation | null> {
        const [graduation] = await this.DBClient
            .select()
            .from(GraduationSchema)
            .where(eq(GraduationSchema.id, id))
        return graduation || null
    }

    async findByStudentAndYear(studentId: string, academicYear: string): Promise<Graduation | null> {
        const [graduation] = await this.DBClient
            .select()
            .from(GraduationSchema)
            .where(and(
                eq(GraduationSchema.student_id, studentId),
                eq(GraduationSchema.academic_year, academicYear)
            ))
        return graduation || null
    }

    async update(id: string, data: UpdateGraduationInput): Promise<Graduation> {
        const [graduation] = await this.DBClient
            .update(GraduationSchema)
            .set({ ...data, updated_at: new Date() })
            .where(eq(GraduationSchema.id, id))
            .returning()
        return graduation
    }

    async delete(id: string): Promise<void> {
        await this.DBClient.delete(GraduationSchema).where(eq(GraduationSchema.id, id))
    }
}
