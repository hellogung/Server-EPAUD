import {ParentService} from "./parent.service";
import {Context} from "hono";
import {createParentValidation, updateParentValidation} from "./parent.validator";
import {handleError} from "../../helper/handleError";

export const ParentController = (service: ParentService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createParentValidation.parse(body)
            const parent = await service.create(data)
            return c.json({
                message: "Orang tua berhasil ditambahkan",
                data: {parent}
            }, 201)
        }
        catch(error) {
            return handleError(c, error)
        }
    },

    getAll: async (c: Context) => {
        const { search, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const parents = await service.getAll({
                search,
                limit: limitNumber,
                offset,
                page: pageNumber,
            })

            const total = Number(parents.total.count)

            return c.json({
                data: parents.data,
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
            const parent = await service.findById(id)
            return c.json({ data: parent })
        } catch (error) {
            return handleError(c, error)
        }
    },

    update: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const body = await c.req.json()
            const data = updateParentValidation.parse(body)
            const parent = await service.update(id, data)
            return c.json({ message: "Data orang tua berhasil diperbarui", data: parent })
        } catch (error) {
            return handleError(c, error)
        }
    },

    delete: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.delete(id)
            return c.json({ message: "Orang tua berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    }
})
