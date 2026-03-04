import {ITeacherRepository} from "./ITeacherRepository";
import {CreateTeacher, Teacher, TeacherSchema} from "../../db/teacher.schema";
import {ilike, or} from "drizzle-orm";

type GetAllParams = {
    search?: string
    limit: number
    offset: number
    page: number
}

export class TeacherService {
    constructor(private readonly repo: ITeacherRepository) {
    }

    async create(data: CreateTeacher): Promise<Teacher> {
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
}