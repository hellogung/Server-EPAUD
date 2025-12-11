import { Context } from "hono";
import { createSchoolValidation } from "./school.validator";
import { WebResponse } from "../../type/WebResponse.type";
import { SchoolService } from "./school.service";
import { SchoolResponseDTO, toSchoolDTO } from "./School.dto";
import { logger } from "../../config/logger";

export const SchoolController = (service: SchoolService) => ({
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const validated = createSchoolValidation.parse(body)

            const data = await service.create(validated)

            const response: WebResponse<SchoolResponseDTO> = {
                message: "Sekolah berhasil ditambahkan.",
                data: toSchoolDTO(data),
            }

            return c.json(response)
        } catch (error) {
            logger.error("Failed CREATE School: " + error)
            return c.json({ message: "Internal server error" }, 500)
        }

    }
})