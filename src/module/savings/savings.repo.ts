import {db} from "../../config/database";
import {Savings, SavingsSchema, SavingsTransaction, SavingsTransactionSchema} from "../../db/savings.schema";
import {eq, sql, SQL} from "drizzle-orm";
import {ISavingsRepository, CreateSavingsInput, CreateTransactionInput, UpdateTransactionStatusInput} from "./ISavingsRepository";

export class SavingsRepository implements ISavingsRepository {
    constructor(private readonly DBClient = db) {}

    // ─── Savings Account ──────────────────────────────────────────────────────────
    async createSavings(data: CreateSavingsInput): Promise<Savings> {
        const [savings] = await this.DBClient.insert(SavingsSchema).values(data).returning()
        return savings
    }

    async findSavingsById(id: string): Promise<Savings | null> {
        const [savings] = await this.DBClient
            .select()
            .from(SavingsSchema)
            .where(eq(SavingsSchema.id, id))
        return savings || null
    }

    async findSavingsByStudentId(studentId: string): Promise<Savings | null> {
        const [savings] = await this.DBClient
            .select()
            .from(SavingsSchema)
            .where(eq(SavingsSchema.student_id, studentId))
        return savings || null
    }

    async getSavingsBySchoolId(schoolId: string): Promise<Savings[]> {
        return await this.DBClient
            .select()
            .from(SavingsSchema)
            .where(eq(SavingsSchema.school_id, schoolId))
    }

    async updateBalance(id: string, newBalance: string): Promise<Savings> {
        const [savings] = await this.DBClient
            .update(SavingsSchema)
            .set({ balance: newBalance, updated_at: new Date() })
            .where(eq(SavingsSchema.id, id))
            .returning()
        return savings
    }

    async deleteSavings(id: string): Promise<void> {
        // Delete transactions first
        await this.DBClient.delete(SavingsTransactionSchema).where(eq(SavingsTransactionSchema.savings_id, id))
        // Then delete savings
        await this.DBClient.delete(SavingsSchema).where(eq(SavingsSchema.id, id))
    }

    // ─── Transactions ─────────────────────────────────────────────────────────────
    async createTransaction(data: CreateTransactionInput): Promise<SavingsTransaction> {
        const [transaction] = await this.DBClient.insert(SavingsTransactionSchema).values(data).returning()
        return transaction
    }

    async getTransactions({limit, offset, condition}: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: SavingsTransaction[], total: {count: number}}> {
        const transactions = await this.DBClient
            .select()
            .from(SavingsTransactionSchema)
            .where(condition)
            .limit(limit)
            .offset(offset)
            .orderBy(sql`${SavingsTransactionSchema.created_at} DESC`)

        const [totalResult] = await this.DBClient
            .select({ count: sql<number>`count(*)` })
            .from(SavingsTransactionSchema)
            .where(condition)

        return {data: transactions, total: totalResult}
    }

    async getTransactionsBySavingsId(savingsId: string): Promise<SavingsTransaction[]> {
        return await this.DBClient
            .select()
            .from(SavingsTransactionSchema)
            .where(eq(SavingsTransactionSchema.savings_id, savingsId))
            .orderBy(sql`${SavingsTransactionSchema.created_at} DESC`)
    }

    async findTransactionById(id: string): Promise<SavingsTransaction | null> {
        const [transaction] = await this.DBClient
            .select()
            .from(SavingsTransactionSchema)
            .where(eq(SavingsTransactionSchema.id, id))
        return transaction || null
    }

    async updateTransactionStatus(id: string, data: UpdateTransactionStatusInput): Promise<SavingsTransaction> {
        const [transaction] = await this.DBClient
            .update(SavingsTransactionSchema)
            .set(data)
            .where(eq(SavingsTransactionSchema.id, id))
            .returning()
        return transaction
    }
}
