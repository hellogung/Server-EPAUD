import { and, eq } from "drizzle-orm";
import { db } from "../../config/database";
import { Auth, AuthSchema, CreateAuth } from "../../db/schema";
import { IAuthRepository } from "./IAuthRepository";

export class AuthRepository implements IAuthRepository {
    constructor(private readonly DBClient = db) { }

    async register(data: CreateAuth): Promise<Auth> {
        const [user] = await this.DBClient.insert(AuthSchema).values(data).returning()
        return user
    }

    async login(data: { username: string; password: string; }): Promise<Auth> {
        const [user] = await this.DBClient.select().from(AuthSchema).where(eq(AuthSchema.username, data.username))
        return user
    }

    async save_token(username: string, token: string): Promise<boolean> {
        await this.DBClient.update(AuthSchema).set({ token: token }).where(eq(AuthSchema.username, username)).returning()
        return true
    }

    async profile(id: string): Promise<Auth> {
        const [user] = await this.DBClient.select().from(AuthSchema).where(eq(AuthSchema.id, id))
        return user
    }
}