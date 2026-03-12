import { eq, like, or } from "drizzle-orm";
import { db } from "../../config/database";
import { Auth, AuthSchema, CreateAuth } from "../../db/auth.schema";
import { IAuthRepository } from "./IAuthRepository";

export class AuthRepository implements IAuthRepository {
    constructor(private readonly DBClient = db) {}

    async register(data: CreateAuth): Promise<Auth> {
        const [user] = await this.DBClient.insert(AuthSchema).values(data).returning()
        return user
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

    async setVerified(id: string): Promise<void> {
        await this.DBClient.update(AuthSchema)
            .set({ is_verified: true })
            .where(eq(AuthSchema.id, id))
    }
}