import {CreateSchool} from "../../db/school.schema";
import {Teacher} from "../../db/teacher.schema";

export interface ITeacherRepository {
    create(data: CreateSchool): Promise<Teacher>
}