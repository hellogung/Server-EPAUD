import {Hono} from "hono";
import {container} from "../../core/container";
import {SavingsController} from "./savings.controller";
import AuthMiddleware from "../auth/auth.middleware";

export const SavingsRoute = () => {
    const app = new Hono()
    const c = SavingsController(container.savingsService)

    // Savings Account
    app.post("/", AuthMiddleware.check, c.create)
    app.get("/:id", AuthMiddleware.check, c.getById)
    app.get("/student/:studentId", AuthMiddleware.check, c.getByStudentId)
    app.get("/school/:schoolId", AuthMiddleware.check, c.getBySchoolId)
    app.delete("/:id", AuthMiddleware.check, c.delete)

    // Deposit & Withdraw
    app.post("/deposit", AuthMiddleware.check, c.deposit)
    app.post("/withdraw", AuthMiddleware.check, c.withdraw)

    // Transactions
    app.get("/transactions", AuthMiddleware.check, c.getTransactions)
    app.get("/transactions/savings/:savingsId", AuthMiddleware.check, c.getTransactionsBySavings)
    app.get("/transactions/:id", AuthMiddleware.check, c.getTransactionById)

    return app
}
