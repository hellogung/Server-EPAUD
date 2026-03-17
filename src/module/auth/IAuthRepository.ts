import { Auth, CreateAuth } from "../../db/auth.schema"
import type { SQL } from "drizzle-orm"

export interface IAuthRepository {
    register(data: CreateAuth): Promise<Auth>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Auth[], total: {count: number}}>
    findById(id: string): Promise<Auth | null>
    findByIdentifier(identifier: string): Promise<Auth | null>
    findUsernamesByPrefix(prefix: string): Promise<string[]>
    setVerified(id: string, type: "email" | "phone"): Promise<void>
}