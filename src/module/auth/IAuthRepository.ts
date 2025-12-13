import { Auth, CreateAuth } from "../../db/schema"

export interface IAuthRepository {
    register(data: CreateAuth): Promise<Auth>
    login(data: { username: string, password: string }): Promise<Auth>
    save_token(usernmae: string, token: string): Promise<boolean>
    // logout(data: any): Promise<any>
    profile(id: string): Promise<Auth>
}