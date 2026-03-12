import {IParentRepository, UpdateParentData, CreateParentData} from "./IParentRepository";
import {Parent, ParentSchema} from "../../db/parent.schema";
import {ilike} from "drizzle-orm";
import {HTTPException} from "hono/http-exception";

type GetAllParams = {
    search?: string
    limit: number
    offset: number
    page: number
}

export class ParentService {
    constructor(private readonly repo: IParentRepository) {
    }

    async create(data: CreateParentData): Promise<Parent> {
        return await this.repo.create(data)
    }

    async getAll({
        search,
        limit,
        offset,
        page,
    }: GetAllParams): Promise<{ data: Parent[], total: { count: number } }> {
        const condition = search ? ilike(ParentSchema.name, `%${search}%`) : undefined

        return await this.repo.getAll({
            condition,
            limit,
            offset
        })
    }

    async findById(id: string): Promise<Parent> {
        const parent = await this.repo.findById(id)
        if (!parent) throw new HTTPException(404, {message: "Orang tua tidak ditemukan"})
        return parent
    }

    async update(id: string, data: UpdateParentData): Promise<Parent> {
        await this.findById(id)
        return await this.repo.update(id, data)
    }

    async delete(id: string): Promise<void> {
        await this.findById(id)
        await this.repo.delete(id)
    }
}
