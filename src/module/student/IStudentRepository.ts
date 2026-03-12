import {CreateStudent, Student} from "../../db/student.schema";
import type {SQL} from "drizzle-orm";

export type UpdateStudentData = {
    nis?: string
    name?: string
    nickname?: string
    gender?: "laki-laki" | "perempuan"
    birthday?: string
    birthplace?: string
    address?: string
    picture?: string
}

export type CreateStudentData = Omit<CreateStudent, 'id'>

export interface IStudentRepository {
    create(data: CreateStudentData): Promise<Student>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Student[], total: {count: number}}>
    findById(id: string): Promise<Student | null>
    findByParentId(parentId: string): Promise<Student[]>
    update(id: string, data: UpdateStudentData): Promise<Student>
    delete(id: string): Promise<void>
}
