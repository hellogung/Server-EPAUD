import {ClassData, CreateClassData, TeacherClass, StudentClass} from "../../db/class.schema";
import type {SQL} from "drizzle-orm";

export type UpdateClassData = {
    name?: string
}

export type CreateClassInput = Omit<CreateClassData, 'id'>

export type AssignmentPeriod = {
    academic_year: string
    semester: number
}

export interface IClassRepository {
    create(data: CreateClassInput): Promise<ClassData>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: ClassData[], total: {count: number}}>
    findById(id: string): Promise<ClassData | null>
    update(id: string, data: UpdateClassData): Promise<ClassData>
    delete(id: string): Promise<void>
    
    // Teacher-Class assignments
    assignTeacher(classId: string, teacherId: string, period: AssignmentPeriod): Promise<TeacherClass>
    bulkAssignTeachers(classId: string, teacherIds: string[], period: AssignmentPeriod): Promise<TeacherClass[]>
    removeTeacher(classId: string, teacherId: string): Promise<void>
    getTeachersByClassId(classId: string, period?: AssignmentPeriod): Promise<TeacherClass[]>
    
    // Student-Class assignments
    assignStudent(classId: string, studentId: string, period: AssignmentPeriod): Promise<StudentClass>
    bulkAssignStudents(classId: string, studentIds: string[], period: AssignmentPeriod): Promise<StudentClass[]>
    removeStudent(classId: string, studentId: string): Promise<void>
    getStudentsByClassId(classId: string, period?: AssignmentPeriod): Promise<StudentClass[]>
}
