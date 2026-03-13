import {GraduationService} from "./graduation.service";
import {Context} from "hono";
import {createGraduationValidation, updateGraduationValidation} from "./graduation.validator";
import {handleError} from "../../helper/handleError";

export const GraduationController = (service: GraduationService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createGraduationValidation.parse(body)
            const userId = c.get("user").id

            const graduation = await service.create({
                ...data,
                graduation_date: data.graduation_date ? new Date(data.graduation_date) : undefined,
                certificate_at: data.certificate_at ? new Date(data.certificate_at) : undefined,
                created_by: userId
            })

            return c.json({
                message: "Data kelulusan berhasil ditambahkan",
                data: graduation
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    getAll: async (c: Context) => {
        const { school_id, student_id, academic_year, status, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const result = await service.getAll({
                school_id,
                student_id,
                academic_year,
                status,
                limit: limitNumber,
                offset,
            })

            const total = Number(result.total.count)

            return c.json({
                data: result.data,
                meta: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber),
                },
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const graduation = await service.findById(id)
            return c.json({ data: graduation })
        } catch (error) {
            return handleError(c, error)
        }
    },

    update: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const body = await c.req.json()
            const data = updateGraduationValidation.parse(body)

            const graduation = await service.update(id, {
                ...data,
                graduation_date: data.graduation_date ? new Date(data.graduation_date) : undefined,
                certificate_at: data.certificate_at ? new Date(data.certificate_at) : undefined,
            })

            return c.json({
                message: "Data kelulusan berhasil diperbarui",
                data: graduation
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    delete: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.delete(id)
            return c.json({ message: "Data kelulusan berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    }
})
