import {TeacherService} from "./teacher.service";
import {Context} from "hono";
import {createTeacherValidation} from "./teacher.validator";


export const TeacherController = (service: TeacherService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = createTeacherValidation.parse(body)
            const teacher = await service.create(data)
            return c.json({
                message: "Guru berhasil ditambahkan",
                data: {
                    id: teacher.id
                }
            }, 201)
        }
        catch(error) {
            return c.json({message: error})
        }
    }
})