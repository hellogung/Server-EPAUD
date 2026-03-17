import { eq, like, or, sql, SQL } from "drizzle-orm";
import { db } from "../../config/database";
import { Auth, AuthSchema, CreateAuth } from "../../db/auth.schema";
import { IAuthRepository } from "./IAuthRepository";

export class AuthRepository implements IAuthRepository {
    constructor(private readonly DBClient = db) {}

    async register(data: CreateAuth): Promise<Auth> {
        const [user] = await this.DBClient.insert(AuthSchema).values(data).returning()
        return user
    }

    async getAll({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Auth[], total: {count: number}}> {
        const users = await this.DBClient
            .select({
                id: AuthSchema.id,
                full_name: AuthSchema.full_name,
                username: AuthSchema.username,
                email: AuthSchema.email,
                phone: AuthSchema.phone,
                role: AuthSchema.role,
                is_active: AuthSchema.is_active,
                email_verified: AuthSchema.email_verified,
                phone_verified: AuthSchema.phone_verified,
                createdAt: AuthSchema.createdAt,
                updatedAt: AuthSchema.updatedAt,
            })
            .from(AuthSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(AuthSchema)
            .where(condition)

        return {data: users as Auth[], total: totalResult}
    }

    async findById(id: string): Promise<Auth | null> {
        const [user] = await this.DBClient.select().from(AuthSchema).where(eq(AuthSchema.id, id))
        return user || null
    }

    async findByIdentifier(identifier: string): Promise<Auth | null> {
        const [user] = await this.DBClient.select().from(AuthSchema).where(
            or(
                eq(AuthSchema.username, identifier),
                eq(AuthSchema.email, identifier),
                eq(AuthSchema.phone, identifier)
            )
        )
        return user || null
    }

    async findUsernamesByPrefix(prefix: string): Promise<string[]> {
        const users = await this.DBClient
            .select({ username: AuthSchema.username })
            .from(AuthSchema)
            .where(like(AuthSchema.username, `${prefix}%`))
        return users.map(u => u.username)
    }

    async setVerified(id: string, type: "email" | "phone"): Promise<void> {
        const updateData = type === "email" 
            ? { email_verified: true, is_active: true }
            : { phone_verified: true, is_active: true }
        
        await this.DBClient.update(AuthSchema)
            .set(updateData)
            .where(eq(AuthSchema.id, id))
    }
}