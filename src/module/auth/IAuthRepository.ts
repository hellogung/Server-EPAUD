import { Auth, CreateAuth } from "../../db/auth.schema"

export interface IAuthRepository {
    register(data: CreateAuth): Promise<Auth>
    findById(id: string): Promise<Auth | null>
    findByIdentifier(identifier: string): Promise<Auth | null>
    findUsernamesByPrefix(prefix: string): Promise<string[]>
    setVerified(id: string): Promise<void>
}