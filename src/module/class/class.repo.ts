import {db} from "../../config/database";
import {ClassData, ClassDataSchema, TeacherClass, TeacherClassSchema, StudentClass, StudentClassSchema} from "../../db/class.schema";
import {and, eq, sql, SQL} from "drizzle-orm";
import {IClassRepository, UpdateClassData, CreateClassInput, AssignmentPeriod} from "./IClassRepository";

export class ClassRepository implements IClassRepository {
    constructor(private readonly DBClient = db) {}

    async create(data: CreateClassInput): Promise<ClassData> {
        const [classData] = await this.DBClient.insert(ClassDataSchema).values(data).returning()
        return classData
    }

    async getAll({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: ClassData[], total: {count: number}}> {
        const classes = await this.DBClient
            .select()
            .from(ClassDataSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(ClassDataSchema)
            .where(condition)

        return {data: classes, total: totalResult}
    }

    async findById(id: string): Promise<ClassData | null> {
        const [classData] = await this.DBClient
            .select()
            .from(ClassDataSchema)
            .where(eq(ClassDataSchema.id, id))
        return classData || null
    }

    async update(id: string, data: UpdateClassData): Promise<ClassData> {
        const [classData] = await this.DBClient
            .update(ClassDataSchema)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(ClassDataSchema.id, id))
            .returning()
        return classData
    }

    async delete(id: string): Promise<void> {
        // Delete related assignments first
        await this.DBClient.delete(TeacherClassSchema).where(eq(TeacherClassSchema.class_id, id))
        await this.DBClient.delete(StudentClassSchema).where(eq(StudentClassSchema.class_id, id))
        // Then delete the class
        await this.DBClient.delete(ClassDataSchema).where(eq(ClassDataSchema.id, id))
    }

    // Teacher-Class assignments
    async assignTeacher(classId: string, teacherId: string, period: AssignmentPeriod): Promise<TeacherClass> {
        const [assignment] = await this.DBClient
            .insert(TeacherClassSchema)
            .values({ 
                class_id: classId, 
                teacher_id: teacherId,
                academic_year: period.academic_year,
                semester: period.semester
            })
            .returning()
        return assignment
    }

    async bulkAssignTeachers(classId: string, teacherIds: string[], period: AssignmentPeriod): Promise<TeacherClass[]> {
        const values = teacherIds.map(teacherId => ({
            class_id: classId,
            teacher_id: teacherId,
            academic_year: period.academic_year,
            semester: period.semester
        }))
        return await this.DBClient
            .insert(TeacherClassSchema)
            .values(values)
            .returning()
    }

    async removeTeacher(classId: string, teacherId: string): Promise<void> {
        await this.DBClient
            .delete(TeacherClassSchema)
            .where(and(
                eq(TeacherClassSchema.class_id, classId),
                eq(TeacherClassSchema.teacher_id, teacherId)
            ))
    }

    async getTeachersByClassId(classId: string, period?: AssignmentPeriod): Promise<TeacherClass[]> {
        const conditions = [eq(TeacherClassSchema.class_id, classId)]
        
        if (period) {
            conditions.push(eq(TeacherClassSchema.academic_year, period.academic_year))
            conditions.push(eq(TeacherClassSchema.semester, period.semester))
        }

        return await this.DBClient
            .select()
            .from(TeacherClassSchema)
            .where(and(...conditions))
    }

    // Student-Class assignments
    async assignStudent(classId: string, studentId: string, period: AssignmentPeriod): Promise<StudentClass> {
        const [assignment] = await this.DBClient
            .insert(StudentClassSchema)
            .values({ 
                class_id: classId, 
                student_id: studentId,
                academic_year: period.academic_year,
                semester: period.semester
            })
            .returning()
        return assignment
    }

    async bulkAssignStudents(classId: string, studentIds: string[], period: AssignmentPeriod): Promise<StudentClass[]> {
        const values = studentIds.map(studentId => ({
            class_id: classId,
            student_id: studentId,
            academic_year: period.academic_year,
            semester: period.semester
        }))
        return await this.DBClient
            .insert(StudentClassSchema)
            .values(values)
            .returning()
    }

    async removeStudent(classId: string, studentId: string): Promise<void> {
        await this.DBClient
            .delete(StudentClassSchema)
            .where(and(
                eq(StudentClassSchema.class_id, classId),
                eq(StudentClassSchema.student_id, studentId)
            ))
    }

    async getStudentsByClassId(classId: string, period?: AssignmentPeriod): Promise<StudentClass[]> {
        const conditions = [eq(StudentClassSchema.class_id, classId)]
        
        if (period) {
            conditions.push(eq(StudentClassSchema.academic_year, period.academic_year))
            conditions.push(eq(StudentClassSchema.semester, period.semester))
        }

        return await this.DBClient
            .select()
            .from(StudentClassSchema)
            .where(and(...conditions))
    }
}
