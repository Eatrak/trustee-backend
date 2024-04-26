import { InferModel } from "drizzle-orm";
import {
    mysqlTable,
    varchar,
    boolean,
    int,
    double,
    decimal,
    unique,
} from "drizzle-orm/mysql-core";

const UUID_LENGTH = 36;

// Table definitions

export const users = mysqlTable("User", {
    id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    name: varchar("name", { length: 256 }).notNull(),
    surname: varchar("surname", { length: 256 }).notNull(),
});

export const userSettings = mysqlTable("UserSettings", {
    id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
    userId: varchar("userId", { length: UUID_LENGTH })
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    currencyId: varchar("currencyId", { length: UUID_LENGTH })
        .notNull()
        .references(() => currencies.id, { onDelete: "no action" }),
    language: varchar("language", { length: 10 }).notNull(),
});

export const currencies = mysqlTable("Currency", {
    id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
    code: varchar("code", { length: 3 }).notNull().unique(),
    symbol: varchar("symbol", { length: 10 }).notNull(),
});

export const transactions = mysqlTable("Transaction", {
    id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    walletId: varchar("walletId", { length: UUID_LENGTH })
        .notNull()
        .references(() => wallets.id, { onDelete: "cascade" }),
    carriedOut: int("carriedOut").notNull(),
    amount: decimal("amount", { precision: 19, scale: 2 }).notNull(),
    isIncome: boolean("isIncome").notNull(),
    createdAt: int("createdAt").notNull(),
});

export const transactionCategories = mysqlTable(
    "TransactionCategory",
    {
        id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
        name: varchar("name", { length: 256 }).notNull(),
        userId: varchar("userId", { length: UUID_LENGTH })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
    },
    (t) => ({
        nameAndUser: unique().on(t.name, t.userId),
    }),
);

export const transactionCategoryRelation = mysqlTable("TransactionCategoryRelation", {
    id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
    transactionId: varchar("transactionId", { length: UUID_LENGTH })
        .notNull()
        .references(() => transactions.id, { onDelete: "cascade" }),
    categoryId: varchar("categoryId", { length: UUID_LENGTH })
        .notNull()
        .references(() => transactionCategories.id, { onDelete: "cascade" }),
});

export const wallets = mysqlTable("Wallet", {
    id: varchar("id", { length: UUID_LENGTH }).primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    userId: varchar("userId", { length: UUID_LENGTH })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    currencyId: varchar("currencyId", { length: UUID_LENGTH })
        .notNull()
        .references(() => currencies.id, { onDelete: "no action" }),
    untrackedBalance: decimal("untrackedBalance", { precision: 19, scale: 2 }).notNull(),
});

// Type definitions
export type User = InferModel<typeof users, "select">;
export type Currency = InferModel<typeof currencies, "select">;
export type Transaction = InferModel<typeof transactions, "select">;
export type TransactionCategory = InferModel<typeof transactionCategories, "select">;
export type CategoryOfTransaction = InferModel<
    typeof transactionCategoryRelation,
    "select"
>;
export type Wallet = InferModel<typeof wallets, "select">;
export type UserSettings = InferModel<typeof userSettings, "select">;
