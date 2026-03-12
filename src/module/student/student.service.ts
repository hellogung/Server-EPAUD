import {IStudentRepository, UpdateStudentData, CreateStudentData} from "./IStudentRepository";
import {Student, StudentSchema} from "../../db/student.schema";
import {and, eq, ilike, or} from "drizzle-orm";
import {HTTPException} from "hono/http-exception";

type GetAllParams = {
    search?: string
    parent_id?: string
    limit: number
    offset: number
    page: number
}

export class StudentService {
    constructor(private readonly repo: IStudentRepository) {
    }

    async create(data: CreateStudentData): Promise<Student> {
        return await this.repo.create(data)
    }

    async getAll({
        search,
        parent_id,
        limit,
        offset,
        page,
    }: GetAllParams): Promise<{ data: Student[], total: { count: number } }> {
        const searchCondition = search ? or(
            ilike(StudentSchema.name, `%${search}%`),
            ilike(StudentSchema.nis, `%${search}%`),
            ilike(StudentSchema.nickname, `%${search}%`)
        ) : undefined

        const parentCondition = parent_id ? eq(StudentSchema.parent_id, parent_id) : undefined

        const condition = searchCondition && parentCondition 
            ? and(searchCondition, parentCondition)
            : searchCondition || parentCondition

        return await this.repo.getAll({
            condition,
            limit,
            offset
        })
    }

    async findById(id: string): Promise<Student> {
        const student = await this.repo.findById(id)
        if (!student) throw new HTTPException(404, {message: "Siswa tidak ditemukan"})
        return student
    }

    async findByParentId(parentId: string): Promise<Student[]> {
        return await this.repo.findByParentId(parentId)
    }

    async update(id: string, data: UpdateStudentData): Promise<Student> {
        await this.findById(id)
        return await this.repo.update(id, data)
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await this.repo.delete(id)
    }
}
