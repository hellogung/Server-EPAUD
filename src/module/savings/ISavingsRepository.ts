import {Savings, SavingsTransaction} from "../../db/savings.schema";
import type {SQL} from "drizzle-orm";

export type CreateSavingsInput = {
    school_id: string
    student_id: string
}

export type CreateTransactionInput = {
    savings_id: string
    type: "deposit" | "withdraw"
    amount: string
    balance_before: string
    balance_after: string
    note?: string
    created_by: string
}

export type UpdateTransactionStatusInput = {
    status: "pending" | "success" | "cancelled"
}

export interface ISavingsRepository {
    // Savings Account
    createSavings(data: CreateSavingsInput): Promise<Savings>
    findSavingsById(id: string): Promise<Savings | null>
    findSavingsByStudentId(studentId: string): Promise<Savings | null>
    getSavingsBySchoolId(schoolId: string): Promise<Savings[]>
    updateBalance(id: string, newBalance: string): Promise<Savings>
    deleteSavings(id: string): Promise<void>

    // Transactions
    createTransaction(data: CreateTransactionInput): Promise<SavingsTransaction>
    getTransactions(data: {limit: number, offset: number, condition: SQL<unknown> | undefined}): Promise<{data: SavingsTransaction[], total: {count: number}}>
    getTransactionsBySavingsId(savingsId: string): Promise<SavingsTransaction[]>
    findTransactionById(id: string): Promise<SavingsTransaction | null>
    updateTransactionStatus(id: string, data: UpdateTransactionStatusInput): Promise<SavingsTransaction>
}
