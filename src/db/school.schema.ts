import { pgEnum, pgTable, timestamp, uuid, varchar, text } from "drizzle-orm/pg-core";

export const schoolTypeEnum = pgEnum('school_type', ['negeri', 'swasta'])
export const schoolCategoryEnum = pgEnum('school_category', ['sps', 'tk', 'kb'])
export const accreditationEnum = pgEnum('accreditation', ['A', 'B', 'C'])

export const SchoolSchema = pgTable("schools", {
    id: uuid().primaryKey().defaultRandom(),
    school_name: varchar({ length: 255 }).notNull(),
    address: text(),
    school_type: schoolTypeEnum(),
    school_category: schoolCategoryEnum(),
    npsn: varchar({ length: 20 }).unique(),
    accreditation: accreditationEnum(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
export type School = typeof SchoolSchema.$inferSelect
export type CreateSchool = typeof SchoolSchema.$inferInsert
