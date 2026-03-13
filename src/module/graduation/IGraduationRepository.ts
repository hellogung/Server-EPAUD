import {Graduation} from "../../db/graduation.schema";
import type {SQL} from "drizzle-orm";

export type CreateGraduationInput = {
    school_id: string
    student_id: string
    status: "graduated" | "not_graduated" | "dropout"
    graduation_date?: Date
    academic_year: string
    grade?: number
    certificate_number?: string
    certificate_path?: string
    certificate_at?: Date
    note?: string
    created_by: string
}

export type UpdateGraduationInput = {
    status?: "graduated" | "not_graduated" | "dropout"
    graduation_date?: Date
    grade?: number
    certificate_number?: string
    certificate_path?: string
    certificate_at?: Date
    note?: string
}

export interface IGraduationRepository {
    create(data: CreateGraduationInput): Promise<Graduation>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Graduation[], total: {count: number}}>
    findById(id: string): Promise<Graduation | null>
    findByStudentAndYear(studentId: string, academicYear: string): Promise<Graduation | null>
    update(id: string, data: UpdateGraduationInput): Promise<Graduation>
    delete(id: string): Promise<void>
}
