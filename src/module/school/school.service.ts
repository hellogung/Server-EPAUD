import { logger } from "../../config/logger";
import { CreateSchool, School } from "../../db/schema";
import { ISchoolRepository } from "./ISchoolRepository";

export class SchoolService {
    constructor(private readonly repo: ISchoolRepository) { }

    async create(data: CreateSchool): Promise<School> {
        return await this.repo.create(data)
    }
}