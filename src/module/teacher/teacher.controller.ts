import {TeacherService} from "./teacher.service";
import {Context} from "hono";
import {createTeacherValidation} from "./teacher.validator";
import {handleError} from "../../helper/handleError";


export const TeacherController = (service: TeacherService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createTeacherValidation.parse(body)
            const teacher = await service.create(data)
            return c.json({
                message: "Guru berhasil ditambahkan",
                data: {teacher}
            }, 201)
        }
        catch(error) {
            return handleError(c, error)
        }
    },
    getAll: async (c: Context) => {
        const { search, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100) // max 100
        const offset = (pageNumber - 1) * limitNumber

        try {
            const teachers = await service.getAll(
                {
                    search,
                    limit: limitNumber,
                    offset,
                    page: pageNumber,
                }
            )

            const total = Number(teachers.total.count)

            return c.json({
                data: teachers.data,
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
    }
})