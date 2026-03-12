import {CreateTeacher, Teacher} from "../../db/teacher.schema";
import type {SQL} from "drizzle-orm";

export type UpdateTeacherData = {
    id_attendance?: string
    name?: string
    address?: string
    kelurahan?: string
    kecamatan?: string
    kota?: string
    provinsi?: string
    academic?: string
    gender?: "laki-laki" | "perempuan"
    email?: string
    phone?: string
    birthday?: string
    joindate?: string
    exitdate?: string
    picture?: string
}

export type CreateTeacherData = Omit<CreateTeacher, 'user_id'>

export interface ITeacherRepository {
    create(data: CreateTeacherData): Promise<Teacher>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Teacher[], total: {count: number}}>
    findById(id: string): Promise<Teacher | null>
    update(id: string, data: UpdateTeacherData): Promise<Teacher>
    delete(id: string): Promise<void>
}