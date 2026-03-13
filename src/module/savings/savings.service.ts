import {ISavingsRepository} from "./ISavingsRepository";
import {Savings, SavingsTransaction, SavingsTransactionSchema} from "../../db/savings.schema";
import {eq, and} from "drizzle-orm";
import {HTTPException} from "hono/http-exception";

type DepositWithdrawInput = {
    student_id: string
    amount: number
    note?: string
    created_by: string
}

type GetTransactionsParams = {
    savings_id?: string
    type?: string
    status?: string
    limit: number
    offset: number
}

export class SavingsService {
    constructor(private readonly repo: ISavingsRepository) {}

    // ─── Savings Account ──────────────────────────────────────────────────────────
    async createSavings(schoolId: string, studentId: string): Promise<Savings> {
        // Check if student already has savings account
        const existing = await this.repo.findSavingsByStudentId(studentId)
        if (existing) {
            throw new HTTPException(400, {message: "Siswa sudah memiliki rekening tabungan"})
        }

        return await this.repo.createSavings({ school_id: schoolId, student_id: studentId })
    }

    async findSavingsById(id: string): Promise<Savings> {
        const savings = await this.repo.findSavingsById(id)
        if (!savings) throw new HTTPException(404, {message: "Rekening tabungan tidak ditemukan"})
        return savings
    }

    async findSavingsByStudentId(studentId: string): Promise<Savings> {
        const savings = await this.repo.findSavingsByStudentId(studentId)
        if (!savings) throw new HTTPException(404, {message: "Siswa belum memiliki rekening tabungan"})
        return savings
    }

    async getSavingsBySchoolId(schoolId: string): Promise<Savings[]> {
        return await this.repo.getSavingsBySchoolId(schoolId)
    }

    async deleteSavings(id: string): Promise<void> {
        await this.findSavingsById(id)
        await this.repo.deleteSavings(id)
    }

    // ─── Deposit & Withdraw ───────────────────────────────────────────────────────
    async deposit(data: DepositWithdrawInput): Promise<SavingsTransaction> {
        const savings = await this.findSavingsByStudentId(data.student_id)
        
        const currentBalance = parseFloat(savings.balance)
        const amount = data.amount
        const newBalance = currentBalance + amount

        // Create transaction
        const transaction = await this.repo.createTransaction({
            savings_id: savings.id,
            type: "deposit",
            amount: amount.toFixed(2),
            balance_before: currentBalance.toFixed(2),
            balance_after: newBalance.toFixed(2),
            note: data.note,
            created_by: data.created_by
        })

        // Update balance
        await this.repo.updateBalance(savings.id, newBalance.toFixed(2))

        return transaction
    }

    async withdraw(data: DepositWithdrawInput): Promise<SavingsTransaction> {
        const savings = await this.findSavingsByStudentId(data.student_id)
        
        const currentBalance = parseFloat(savings.balance)
        const amount = data.amount
        const newBalance = currentBalance - amount

        if (newBalance < 0) {
            throw new HTTPException(400, {message: "Saldo tidak mencukupi"})
        }

        // Create transaction
        const transaction = await this.repo.createTransaction({
            savings_id: savings.id,
            type: "withdraw",
            amount: amount.toFixed(2),
            balance_before: currentBalance.toFixed(2),
            balance_after: newBalance.toFixed(2),
            note: data.note,
            created_by: data.created_by
        })

        // Update balance
        await this.repo.updateBalance(savings.id, newBalance.toFixed(2))

        return transaction
    }

    // ─── Transactions ─────────────────────────────────────────────────────────────
    async getTransactions({
        savings_id,
        type,
        status,
        limit,
        offset,
    }: GetTransactionsParams): Promise<{data: SavingsTransaction[], total: {count: number}}> {
        const conditions = []

        if (savings_id) {
            conditions.push(eq(SavingsTransactionSchema.savings_id, savings_id))
        }
        if (type) {
            conditions.push(eq(SavingsTransactionSchema.type, type as "deposit" | "withdraw"))
        }
        if (status) {
            conditions.push(eq(SavingsTransactionSchema.status, status as "pending" | "success" | "cancelled"))
        }

        const condition = conditions.length > 0 ? and(...conditions) : undefined

        return await this.repo.getTransactions({condition, limit, offset})
    }

    async getTransactionsBySavingsId(savingsId: string): Promise<SavingsTransaction[]> {
        await this.findSavingsById(savingsId)
        return await this.repo.getTransactionsBySavingsId(savingsId)
    }

    async findTransactionById(id: string): Promise<SavingsTransaction> {
        const transaction = await this.repo.findTransactionById(id)
        if (!transaction) throw new HTTPException(404, {message: "Transaksi tidak ditemukan"})
        return transaction
    }
}
