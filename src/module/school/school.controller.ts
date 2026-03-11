import { Context } from "hono";
import { createSchoolValidation, updateSchoolValidation } from "./school.validator";
import { SchoolService } from "./school.service";
import {handleError} from "../../helper/handleError";


export const SchoolController = (service: SchoolService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createSchoolValidation.parse(body)
            const school = await service.create(data)
            return c.json({ message: "Sekolah berhasil ditambahkan", data: { id: school.id } }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    getById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const school = await service.findById(id)
            return c.json({ data: school })
        } catch (error) {
            return handleError(c, error)
        }
    },

    update: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const body = await c.req.json()
            const data = updateSchoolValidation.parse(body)
            const school = await service.update(id, data)
            return c.json({ message: "Data sekolah berhasil diperbarui", data: school })
        } catch (error) {
            return handleError(c, error)
        }
    }
})