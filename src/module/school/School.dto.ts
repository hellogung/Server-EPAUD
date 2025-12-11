import { School, SchoolSchema } from "../../db/schema"

export type SchoolResponseDTO = {
  id: String
  school_name: String
  createdAt: Date
}

export const toSchoolDTO = (entity: School): SchoolResponseDTO => ({
  id: entity.id,
  school_name: entity.school_name,
  createdAt: entity.createdAt
})