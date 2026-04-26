import { db } from "../../config/database";
import { CreateTeacher, Teacher, TeacherSchema } from "../../db/teacher.schema";
import { AuthSchema } from "../../db/auth.schema";
import { eq, sql, SQL } from "drizzle-orm";
import { ITeacherRepository, UpdateTeacherData, CreateTeacherData } from "./ITeacherRepository";
import { generateUsername } from "../auth/auth.service";
import { IAuthRepository } from "../auth/IAuthRepository";

export class TeacherRepository implements ITeacherRepository {
    constructor(
        private readonly DBClient = db,
        private readonly authRepo?: IAuthRepository
    ) { }

    async create(data: CreateTeacherData): Promise<Teacher> {
        if (!this.authRepo) throw new Error("AuthRepository is required for create operation")

        return await this.DBClient.transaction(async (tx) => {
            // Generate username from name
            const username = await generateUsername(data.name, this.authRepo!)

            const DEFAULT_PASSWORD = "@User123$"

            // Hash default password
            const hashedPassword = await Bun.password.hash(DEFAULT_PASSWORD, { algorithm: "bcrypt", cost: 10 })

            // 1. Create user with role "teacher" (auto active, can login immediately)
            const [user] = await tx.insert(AuthSchema).values({
                full_name: data.name,
                username,
                password: hashedPassword,
                email: data.email,
                phone: data.phone,
                role: "teacher",
                is_active: true,         // Can login immediately
                email_verified: false,   // Can verify email later (optional)
                phone_verified: false    // Can verify phone later (optional)
            }).returning()

            // 2. Create teacher linked to the user
            const [teacher] = await tx.insert(TeacherSchema).values({
                ...data,
                user_id: user.id
            }).returning()

            return teacher
        })
    }

    async getAll({ limit, offset, condition }: { limit: number, offset: number, condition: SQL<unknown> | undefined }): Promise<{ data: Teacher[], total: { count: number } }> {
        const teachers = await this.DBClient
            .select()
            .from(TeacherSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(TeacherSchema)
            .where(condition)

        return { data: teachers, total: totalResult }
    }

    async findById(id: string): Promise<Teacher | null> {
        const [teacher] = await this.DBClient
            .select()
            .from(TeacherSchema)
            .where(eq(TeacherSchema.id, id))
        return teacher || null
    }

    async update(id: string, data: UpdateTeacherData): Promise<Teacher> {
        const [teacher] = await this.DBClient
            .update(TeacherSchema)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(TeacherSchema.id, id))
            .returning()
        return teacher
    }

    async delete(id: string): Promise<void> {
        await this.DBClient
            .delete(TeacherSchema)
            .where(eq(TeacherSchema.id, id))
    }
}