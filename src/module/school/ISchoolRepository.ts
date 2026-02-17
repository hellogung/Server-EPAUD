import { CreateSchool, School } from "../../db/school.schema"

export type UpdateSchoolData = {
    address?: string
    school_type?: 'negeri' | 'swasta'
    school_category?: 'sps' | 'tk' | 'kb'
    npsn?: string
    accreditation?: 'A' | 'B' | 'C'
}

export interface ISchoolRepository {
    create(data: CreateSchool): Promise<School>
    findById(id: string): Promise<School | null>
    update(id: string, data: UpdateSchoolData): Promise<School>
}