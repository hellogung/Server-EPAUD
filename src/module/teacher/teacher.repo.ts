import {db} from "../../config/database";
import {CreateTeacher, Teacher, TeacherSchema} from "../../db/teacher.schema";

export class TeacherRepository {
    constructor(private  readonly DBClient = db) {
    }

    async create(data: CreateTeacher): Promise<Teacher> {
        const [teacher] = await this.DBClient.insert(TeacherSchema).values(data).returning()
        return teacher
    }
}