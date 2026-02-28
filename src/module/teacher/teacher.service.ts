import {ITeacherRepository} from "./ITeacherRepository";
import {CreateTeacher, Teacher} from "../../db/teacher.schema";

export class TeacherService {
    constructor(private readonly repo: ITeacherRepository) {
    }

    async create(data: CreateTeacher): Promise<Teacher> {
        return await this.repo.create(data)
    }
}