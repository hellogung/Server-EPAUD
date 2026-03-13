import {IGraduationRepository, CreateGraduationInput, UpdateGraduationInput} from "./IGraduationRepository";
import {Graduation, GraduationSchema} from "../../db/graduation.schema";
import {eq, and, ilike} from "drizzle-orm";
import {HTTPException} from "hono/http-exception";

type GetAllParams = {
    school_id?: string
    student_id?: string
    academic_year?: string
    status?: string
    limit: number
    offset: number
}

export class GraduationService {
    constructor(private readonly repo: IGraduationRepository) {}

    async create(data: CreateGraduationInput): Promise<Graduation> {
        // Check if student already has graduation record for the same academic year
        const existing = await this.repo.findByStudentAndYear(data.student_id, data.academic_year)
        if (existing) {
            throw new HTTPException(400, {message: "Siswa sudah memiliki data kelulusan untuk tahun ajaran ini"})
        }

        // Validate: if status is graduated, certificate_path is required
        if (data.status === "graduated" && !data.certificate_path) {
            throw new HTTPException(400, {message: "File ijazah wajib diisi untuk status lulus"})
        }

        return await this.repo.create(data)
    }

    async getAll({
        school_id,
        student_id,
        academic_year,
        status,
        limit,
        offset,
    }: GetAllParams): Promise<{data: Graduation[], total: {count: number}}> {
        const conditions = []

        if (school_id) {
            conditions.push(eq(GraduationSchema.school_id, school_id))
        }
        if (student_id) {
            conditions.push(eq(GraduationSchema.student_id, student_id))
        }
        if (academic_year) {
            conditions.push(eq(GraduationSchema.academic_year, academic_year))
        }
        if (status) {
            conditions.push(eq(GraduationSchema.status, status as "graduated" | "not_graduated" | "dropout"))
        }

        const condition = conditions.length > 0 ? and(...conditions) : undefined

        return await this.repo.getAll({condition, limit, offset})
    }

    async findById(id: string): Promise<Graduation> {
        const graduation = await this.repo.findById(id)
        if (!graduation) throw new HTTPException(404, {message: "Data kelulusan tidak ditemukan"})
        return graduation
    }

    async update(id: string, data: UpdateGraduationInput): Promise<Graduation> {
        const existing = await this.findById(id)

        // Validate: if updating status to graduated, certificate_path must exist
        if (data.status === "graduated") {
            const certificatePath = data.certificate_path || existing.certificate_path
            if (!certificatePath) {
                throw new HTTPException(400, {message: "File ijazah wajib diisi untuk status lulus"})
            }
        }

        return await this.repo.update(id, data)
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await this.repo.delete(id)
    }
}
