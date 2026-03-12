import {db} from "../../config/database";
import {Parent, ParentSchema} from "../../db/parent.schema";
import {AuthSchema} from "../../db/auth.schema";
import {eq, sql, SQL} from "drizzle-orm";
import {IParentRepository, UpdateParentData, CreateParentData} from "./IParentRepository";
import {generateUsername} from "../auth/auth.service";
import {IAuthRepository} from "../auth/IAuthRepository";

export class ParentRepository implements IParentRepository {
    constructor(
        private readonly DBClient = db,
        private readonly authRepo?: IAuthRepository
    ) {}

    async create(data: CreateParentData): Promise<Parent> {
        if (!this.authRepo) throw new Error("AuthRepository is required for create operation")
        
        return await this.DBClient.transaction(async (tx) => {
            const username = await generateUsername(data.name, this.authRepo!)

            const DEFAULT_PASSWORD = "@User123$"
            const hashedPassword = await Bun.password.hash(DEFAULT_PASSWORD, {algorithm: "bcrypt", cost: 10})

            // 1. Create user with role "parent"
            const [user] = await tx.insert(AuthSchema).values({
                full_name: data.name,
                username,
                password: hashedPassword,
                role: "parent",
                is_verified: false
            }).returning()

            // 2. Create parent linked to the user
            const [parent] = await tx.insert(ParentSchema).values({
                ...data,
                user_id: user.id
            }).returning()

            return parent
        })
    }

    async getAll({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Parent[], total: {count: number}}> {
        const parents = await this.DBClient
            .select()
            .from(ParentSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(ParentSchema)
            .where(condition)

        return {data: parents, total: totalResult}
    }

    async findById(id: string): Promise<Parent | null> {
        const [parent] = await this.DBClient
            .select()
            .from(ParentSchema)
            .where(eq(ParentSchema.id, id))
        return parent || null
    }

    async update(id: string, data: UpdateParentData): Promise<Parent> {
        const [parent] = await this.DBClient
            .update(ParentSchema)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(ParentSchema.id, id))
            .returning()
        return parent
    }

    async delete(id: string): Promise<void> {
        await this.DBClient
            .delete(ParentSchema)
            .where(eq(ParentSchema.id, id))
    }
}
