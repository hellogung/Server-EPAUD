import {HTTPException} from "hono/http-exception";
import {CreateSchool, School, SchoolSchema} from "../../db/school.schema";
import {ISchoolRepository, UpdateSchoolData} from "./ISchoolRepository";
import {and, ilike, or} from "drizzle-orm";

type GetAllParams = {
    search?: string
    school_type?: string
    limit: number
    offset: number
    page: number
}

export class SchoolService {
    constructor(private readonly repo: ISchoolRepository) {
    }

    async create(data: CreateSchool): Promise<School> {
        return await this.repo.create(data)
    }

    async getAll({
        search,
        school_type,
        limit,
        offset,
    }: GetAllParams): Promise<{ data: School[], total: { count: number } }> {
        const searchCondition = search ? or(
            ilike(SchoolSchema.school_name, `%${search}%`),
            ilike(SchoolSchema.npsn, `%${search}%`),
            ilike(SchoolSchema.address, `%${search}%`)
        ) : undefined

        const typeCondition = school_type ? ilike(SchoolSchema.school_type, school_type) : undefined

        const condition = searchCondition && typeCondition
            ? and(searchCondition, typeCondition)
            : searchCondition || typeCondition

        return await this.repo.getAll({ condition, limit, offset })
    }

    async findById(id: string): Promise<School> {
        const school = await this.repo.findById(id)
        if (!school) throw new HTTPException(404, {message: "Sekolah tidak ditemukan"})
        return school
    }

    async update(id: string, data: UpdateSchoolData): Promise<School> {
        await this.findById(id)
        return await this.repo.update(id, data)
    }
}