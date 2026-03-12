import {StudentService} from "./student.service";
import {Context} from "hono";
import {createStudentValidation, updateStudentValidation} from "./student.validator";
import {handleError} from "../../helper/handleError";

export const StudentController = (service: StudentService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createStudentValidation.parse(body)
            const student = await service.create(data)
            return c.json({
                message: "Siswa berhasil ditambahkan",
                data: {student}
            }, 201)
        }
        catch(error) {
            return handleError(c, error)
        }
    },

    getAll: async (c: Context) => {
        const { search, parent_id, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const students = await service.getAll({
                search,
                parent_id,
                limit: limitNumber,
                offset,
                page: pageNumber,
            })

            const total = Number(students.total.count)

            return c.json({
                data: students.data,
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
            const student = await service.findById(id)
            return c.json({ data: student })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getByParentId: async (c: Context) => {
        try {
            const parentId = c.req.param("parentId")
            const students = await service.findByParentId(parentId)
            return c.json({ data: students })
        } catch (error) {
            return handleError(c, error)
        }
    },

    update: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const body = await c.req.json()
            const data = updateStudentValidation.parse(body)
            const student = await service.update(id, data)
            return c.json({ message: "Data siswa berhasil diperbarui", data: student })
        } catch (error) {
            return handleError(c, error)
        }
    },

    delete: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.delete(id)
            return c.json({ message: "Siswa berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    }
})
