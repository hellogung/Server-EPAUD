import {CreateSchool} from "../../db/school.schema";
import {Teacher} from "../../db/teacher.schema";
import type {SQL} from "drizzle-orm";

export interface ITeacherRepository {
    create(data: CreateSchool): Promise<Teacher>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Teacher[], total: {count: number}}>
}