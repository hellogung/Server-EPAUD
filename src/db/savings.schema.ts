import { pgEnum, pgTable, uuid, varchar, numeric, timestamp, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { StudentSchema } from "./student.schema";
import { SchoolSchema } from "./school.schema";

// ─── ENUM ────────────────────────────────────────────────────────────────────

export const TransactionTypeEnum = pgEnum("transaction_type", [
    "deposit",   // setor
    "withdraw",  // tarik
]);

export const TransactionStatusEnum = pgEnum("transaction_status", [
    "pending",
    "success",
    "cancelled",
]);

// ─── SAVINGS (rekening tabungan per siswa) ───────────────────────────────────

export const SavingsSchema = pgTable("savings", {
    id:         uuid().primaryKey().defaultRandom(),
    school_id:  uuid().notNull().references(() => SchoolSchema.id, { onDelete: "cascade" }),
    student_id: uuid().notNull().unique().references(() => StudentSchema.id, { onDelete: "cascade" }),

    // Saldo dihitung dari transaksi, disimpan di sini sebagai cache
    balance:    numeric({ precision: 15, scale: 2 }).notNull().default("0"),

    created_at: timestamp({ withTimezone: true }).defaultNow(),
    updated_at: timestamp({ withTimezone: true }).defaultNow(),
});

// ─── SAVINGS TRANSACTIONS (riwayat setor & tarik) ────────────────────────────

export const SavingsTransactionSchema = pgTable("savings_transactions", {
    id:          uuid().primaryKey().defaultRandom(),
    savings_id:  uuid().notNull().references(() => SavingsSchema.id, { onDelete: "cascade" }),

    type:        TransactionTypeEnum("type").notNull(),       // deposit | withdraw
    status:      TransactionStatusEnum("status").notNull().default("pending"),

    amount:      numeric({ precision: 15, scale: 2 }).notNull(),
    balance_before: numeric({ precision: 15, scale: 2 }).notNull(), // saldo sebelum transaksi
    balance_after:  numeric({ precision: 15, scale: 2 }).notNull(), // saldo setelah transaksi

    note:        text("note"),
    created_by:  uuid().notNull(), // admin/user id yang melakukan transaksi
    created_at:  timestamp({ withTimezone: true }).defaultNow(),
}, (t) => [
    // Nominal harus lebih dari 0
    sql`CONSTRAINT chk_amount_positive CHECK (${t.amount} > 0)`,
    // Saldo tidak boleh negatif
    sql`CONSTRAINT chk_balance_after CHECK (${t.balance_after} >= 0)`,
]);