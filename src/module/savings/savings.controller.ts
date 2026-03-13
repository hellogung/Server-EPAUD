import {SavingsService} from "./savings.service";
import {Context} from "hono";
import {createSavingsValidation, depositValidation, withdrawValidation} from "./savings.validator";
import {handleError} from "../../helper/handleError";

export const SavingsController = (service: SavingsService) => ({
    // ─── Savings Account ──────────────────────────────────────────────────────────
    create: async (c: Context) => {
        try {
            const body = await c.req.json()
            const { school_id, student_id } = createSavingsValidation.parse(body)
            const savings = await service.createSavings(school_id, student_id)
            return c.json({
                message: "Rekening tabungan berhasil dibuat",
                data: savings
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    getById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const savings = await service.findSavingsById(id)
            return c.json({ data: savings })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getByStudentId: async (c: Context) => {
        try {
            const studentId = c.req.param("studentId")
            const savings = await service.findSavingsByStudentId(studentId)
            return c.json({ data: savings })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getBySchoolId: async (c: Context) => {
        try {
            const schoolId = c.req.param("schoolId")
            const savings = await service.getSavingsBySchoolId(schoolId)
            return c.json({ data: savings })
        } catch (error) {
            return handleError(c, error)
        }
    },

    delete: async (c: Context) => {
        try {
            const id = c.req.param("id")
            await service.deleteSavings(id)
            return c.json({ message: "Rekening tabungan berhasil dihapus" })
        } catch (error) {
            return handleError(c, error)
        }
    },

    // ─── Deposit & Withdraw ───────────────────────────────────────────────────────
    deposit: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = depositValidation.parse(body)
            const userId = c.get("user").id

            const transaction = await service.deposit({
                ...data,
                created_by: userId
            })

            return c.json({
                message: "Setoran berhasil",
                data: transaction
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    withdraw: async (c: Context) => {
        try {
            const body = await c.req.json()
            const data = withdrawValidation.parse(body)
            const userId = c.get("user").id

            const transaction = await service.withdraw({
                ...data,
                created_by: userId
            })

            return c.json({
                message: "Penarikan berhasil",
                data: transaction
            }, 201)
        } catch (error) {
            return handleError(c, error)
        }
    },

    // ─── Transactions ─────────────────────────────────────────────────────────────
    getTransactions: async (c: Context) => {
        const { savings_id, type, status, page = "1", limit = "10" } = c.req.query()

        const pageNumber = Math.max(Number(page), 1)
        const limitNumber = Math.min(Math.max(Number(limit), 1), 100)
        const offset = (pageNumber - 1) * limitNumber

        try {
            const result = await service.getTransactions({
                savings_id,
                type,
                status,
                limit: limitNumber,
                offset,
            })

            const total = Number(result.total.count)

            return c.json({
                data: result.data,
                meta: {
                    page: pageNumber,
                    limit: limitNumber,
                    total,
                    totalPages: Math.ceil(total / limitNumber),
                },
            })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getTransactionsBySavings: async (c: Context) => {
        try {
            const savingsId = c.req.param("savingsId")
            const transactions = await service.getTransactionsBySavingsId(savingsId)
            return c.json({ data: transactions })
        } catch (error) {
            return handleError(c, error)
        }
    },

    getTransactionById: async (c: Context) => {
        try {
            const id = c.req.param("id")
            const transaction = await service.findTransactionById(id)
            return c.json({ data: transaction })
        } catch (error) {
            return handleError(c, error)
        }
    }
})
