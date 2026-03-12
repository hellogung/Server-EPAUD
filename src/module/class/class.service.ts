import {IClassRepository, UpdateClassData, CreateClassInput, AssignmentPeriod} from "./IClassRepository";
import {ClassData, ClassDataSchema, TeacherClass, StudentClass} from "../../db/class.schema";
import {and, eq, ilike} from "drizzle-orm";
import {HTTPException} from "hono/http-exception";

type GetAllParams = {
    search?: string
    school_id?: string
    limit: number
    offset: number
    page: number
}

export class ClassService {
    constructor(private readonly repo: IClassRepository) {}

    async create(data: CreateClassInput): Promise<ClassData> {
        return await this.repo.create(data)
    }

    async getAll({
        search,
        school_id,
        limit,
        offset,
        page,
    }: GetAllParams): Promise<{ data: ClassData[], total: { count: number } }> {
        const searchCondition = search ? ilike(ClassDataSchema.name, `%${search}%`) : undefined
        const schoolCondition = school_id ? eq(ClassDataSchema.school_id, school_id) : undefined
        
        const condition = searchCondition && schoolCondition 
            ? and(searchCondition, schoolCondition)
            : searchCondition || schoolCondition

        return await this.repo.getAll({
            condition,
            limit,
            offset
        })
    }

    async findById(id: string): Promise<ClassData> {
        const classData = await this.repo.findById(id)
        if (!classData) throw new HTTPException(404, {message: "Kelas tidak ditemukan"})
        return classData
    }

    async update(id: string, data: UpdateClassData): Promise<ClassData> {
        await this.findById(id)
        return await this.repo.update(id, data)
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await this.repo.delete(id)
    }

    // Teacher assignments
    async assignTeacher(classId: string, teacherId: string, period: AssignmentPeriod): Promise<TeacherClass> {
        await this.findById(classId)
        return await this.repo.assignTeacher(classId, teacherId, period)
    }

    async bulkAssignTeachers(classId: string, teacherIds: string[], period: AssignmentPeriod): Promise<TeacherClass[]> {
        await this.findById(classId)
        return await this.repo.bulkAssignTeachers(classId, teacherIds, period)
    }

    async removeTeacher(classId: string, teacherId: string): Promise<void> {
        await this.findById(classId)
        await this.repo.removeTeacher(classId, teacherId)
    }

    async getTeachers(classId: string, period?: AssignmentPeriod): Promise<TeacherClass[]> {
        await this.findById(classId)
        return await this.repo.getTeachersByClassId(classId, period)
    }

    // Student assignments
    async assignStudent(classId: string, studentId: string, period: AssignmentPeriod): Promise<StudentClass> {
        await this.findById(classId)
        return await this.repo.assignStudent(classId, studentId, period)
    }

    async bulkAssignStudents(classId: string, studentIds: string[], period: AssignmentPeriod): Promise<StudentClass[]> {
        await this.findById(classId)
        return await this.repo.bulkAssignStudents(classId, studentIds, period)
    }

    async removeStudent(classId: string, studentId: string): Promise<void> {
        await this.findById(classId)
        await this.repo.removeStudent(classId, studentId)
    }

    async getStudents(classId: string, period?: AssignmentPeriod): Promise<StudentClass[]> {
        await this.findById(classId)
        return await this.repo.getStudentsByClassId(classId, period)
    }
}
