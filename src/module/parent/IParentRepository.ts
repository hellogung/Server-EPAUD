import {CreateParent, Parent} from "../../db/parent.schema";
import type {SQL} from "drizzle-orm";

export type UpdateParentData = {
    name?: string
    address?: string
    gender?: "laki-laki" | "perempuan"
    occupation?: string
}

export type CreateParentData = Omit<CreateParent, 'user_id'>

export interface IParentRepository {
    create(data: CreateParentData): Promise<Parent>
    getAll(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: Parent[], total: {count: number}}>
    findById(id: string): Promise<Parent | null>
    update(id: string, data: UpdateParentData): Promise<Parent>
    delete(id: string): Promise<void>
}
