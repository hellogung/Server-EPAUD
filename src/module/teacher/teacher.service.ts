import { ITeacherRepository, UpdateTeacherData, CreateTeacherData } from "./ITeacherRepository";
import { Teacher, TeacherSchema } from "../../db/teacher.schema";
import { ilike, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";

type GetAllParams = {
    search?: string
    limit: number
    offset: number
    page: number
}

export class TeacherService {
    constructor(private readonly repo: ITeacherRepository) {
    }

    async create(data: CreateTeacherData): Promise<Teacher> {
        return await this.repo.create(data)
    }

    async getAll({
        search,
        limit,
        offset,
        page,
    }: GetAllParams): Promise<{ data: Teacher[], total: { count: number } }> {
        const condition = search ? or(
            ilike(TeacherSchema.name, `%${search}%`),
            ilike(TeacherSchema.email, `%${search}%`)
        ) : undefined

        return await this.repo.getAll({
            condition,
            limit,
            offset
        })
    }

    async findById(id: string): Promise<Teacher> {
        const teacher = await this.repo.findById(id)
        if (!teacher) throw new HTTPException(404, { message: "Guru tidak ditemukan" })
        return teacher
    }

    async update(id: string, data: UpdateTeacherData): Promise<Teacher> {
        await this.findById(id) // Check exists
        return await this.repo.update(id, data)
    }

    async delete(id: string): Promise<void> {
        await this.findById(id) // Check exists
        await this.repo.delete(id)
    }
}