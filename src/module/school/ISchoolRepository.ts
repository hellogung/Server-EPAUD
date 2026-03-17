import { CreateSchool, School } from "../../db/school.schema"
import type { SQL } from "drizzle-orm"

export type UpdateSchoolData = {
    address?: string
    school_type?: 'negeri' | 'swasta'
    school_category?: 'sps' | 'tk' | 'kb'
    npsn?: string
    accreditation?: 'A' | 'B' | 'C'
}

export interface ISchoolRepository {
    create(data: CreateSchool): Promise<School>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: School[], total: {count: number}}>
    findById(id: string): Promise<School | null>
    update(id: string, data: UpdateSchoolData): Promise<School>
}