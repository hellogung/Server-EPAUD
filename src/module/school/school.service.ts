import {HTTPException} from "hono/http-exception";
import {CreateSchool, School} from "../../db/school.schema";
import {ISchoolRepository, UpdateSchoolData} from "./ISchoolRepository";

export class SchoolService {
    constructor(private readonly repo: ISchoolRepository) {
    }

    async create(data: CreateSchool): Promise<School> {
        return await this.repo.create(data)
    }

    async findById(id: string): Promise<School> {
        const school = await this.repo.findById(id)
        if (!school) throw new HTTPException(404, {message: "Sekolah tidak ditemukan"})
        return school
    }

    async update(id: string, data: UpdateSchoolData): Promise<School> {
        await this.findById(id) // Check exists
        return await this.repo.update(id, data)
    }
}