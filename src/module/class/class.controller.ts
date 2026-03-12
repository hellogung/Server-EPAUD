import {ClassService} from "./class.service";
import {Context} from "hono";
import {createClassValidation, updateClassValidation, assignTeacherValidation, assignStudentValidation, bulkAssignTeachersValidation, bulkAssignStudentsValidation} from "./class.validator";
import {handleError} from "../../helper/handleError";

export const ClassController = (service: ClassService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createClassValidation.parse(body)
            const classData = await service.create(data)
            return c.json({
                message: "Kelas berhasil ditambahkan",
                data: {class: classData}
            }, 201)
        }
        catch(error) {
            return handleError(c, error)
        }
    },

    getAll: async (c: Context) => {
        const { search, school_id, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const classes = await service.getAll({
                search,
                school_id,
                limit: limitNumber,
                offset,
                page: pageNumber,
            })

            const total = Number(classes.total.count)

            return c.json({
                data: classes.data,
                meta: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber),
                },
            }, 200)
        }
        catch (error) {
            return handleError(c, error)
        }
    },

    getById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const classData = await service.findById(id)
            return c.json({ data: classData })
        } catch (error) {
            return handleError(c, error)
        }
    },

    update: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const body = await c.req.json()
            const data = updateClassValidation.parse(body)
            const classData = await service.update(id, data)
            return c.json({ message: "Data kelas berhasil diperbarui", data: classData })
        } catch (error) {
            return handleError(c, error)
        }
    },

    delete: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.delete(id)
            return c.json({ message: "Kelas berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    // Teacher assignments
    assignTeacher: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const body = await c.req.json()
            const { teacher_id, academic_year, semester } = assignTeacherValidation.parse(body)
            const assignment = await service.assignTeacher(classId, teacher_id, { academic_year, semester })
            return c.json({ message: "Guru berhasil ditambahkan ke kelas", data: assignment }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    bulkAssignTeachers: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const body = await c.req.json()
            const { teacher_ids, academic_year, semester } = bulkAssignTeachersValidation.parse(body)
            const assignments = await service.bulkAssignTeachers(classId, teacher_ids, { academic_year, semester })
            return c.json({ 
                message: `${assignments.length} guru berhasil ditambahkan ke kelas`, 
                data: assignments 
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    removeTeacher: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const teacherId = c.req.param("teacherId")
            await service.removeTeacher(classId, teacherId)
            return c.json({ message: "Guru berhasil dihapus dari kelas" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getTeachers: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const { academic_year, semester } = c.req.query()
            const period = academic_year && semester 
                ? { academic_year, semester: Number(semester) } 
                : undefined
            const teachers = await service.getTeachers(classId, period)
            return c.json({ data: teachers })
        } catch (error) {
            return handleError(c, error)
        }
    },

    // Student assignments
    assignStudent: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const body = await c.req.json()
            const { student_id, academic_year, semester } = assignStudentValidation.parse(body)
            const assignment = await service.assignStudent(classId, student_id, { academic_year, semester })
            return c.json({ message: "Siswa berhasil ditambahkan ke kelas", data: assignment }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    bulkAssignStudents: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const body = await c.req.json()
            const { student_ids, academic_year, semester } = bulkAssignStudentsValidation.parse(body)
            const assignments = await service.bulkAssignStudents(classId, student_ids, { academic_year, semester })
            return c.json({ 
                message: `${assignments.length} siswa berhasil ditambahkan ke kelas`, 
                data: assignments 
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    removeStudent: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const studentId = c.req.param("studentId")
            await service.removeStudent(classId, studentId)
            return c.json({ message: "Siswa berhasil dihapus dari kelas" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getStudents: async (c: Context) => {
        try {
            const classId = c.req.param("id")
            const { academic_year, semester } = c.req.query()
            const period = academic_year && semester 
                ? { academic_year, semester: Number(semester) } 
                : undefined
            const students = await service.getStudents(classId, period)
            return c.json({ data: students })
        } catch (error) {
            return handleError(c, error)
        }
    }
})
