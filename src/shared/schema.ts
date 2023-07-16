import { InferModel } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  boolean,
  float,
  int
} from "drizzle-orm/mysql-core";


const UUID_LENGTH = 36;


// Table definitions

export const users = mysqlTable('User', {
  id: varchar('id', { length: UUID_LENGTH }).primaryKey(),
  email: varchar('email', { length: 256 }).notNull().unique()
});

export const currencies = mysqlTable('Currency', {
  id: varchar('id', { length: UUID_LENGTH }).primaryKey(),
  code: varchar('code', { length: 3 }).notNull().unique(),
  symbol: varchar('symbol', { length: 10 }).notNull()
});

export const transactions = mysqlTable('Transaction', {
  id: varchar('id', { length: UUID_LENGTH }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  userId: varchar('userId', { length: UUID_LENGTH }).notNull().references(() => users.id),
  walletId: varchar('walletId', { length: UUID_LENGTH }).notNull().references(() => wallets.id),
  categoryId: varchar('categoryId', { length: UUID_LENGTH }).notNull().references(() => transactionCategories.id),
  carriedOut: int('carriedOut').notNull(),
  amount: float('amount').notNull(),
  isIncome: boolean('isIncome').notNull(),
  createdAt: int('createdAt').notNull()
});

export const transactionCategories = mysqlTable('TransactionCategory', {
  id: varchar('id', { length: UUID_LENGTH }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull().unique(),
  userId: varchar('userId', { length: UUID_LENGTH }).notNull().references(() => users.id)
});

export const wallets = mysqlTable('Wallet', {
  id: varchar('id', { length: UUID_LENGTH }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull().unique(),
  userId: varchar('userId', { length: UUID_LENGTH }).notNull().references(() => users.id),
  currencyId: varchar('currencyCode', { length: UUID_LENGTH }).notNull().references(() => currencies.id)
});

// Type definitions
export type User = InferModel<typeof users, "select">;
export type Currency = InferModel<typeof currencies, "select">;
export type Transaction = InferModel<typeof transactions, "select">;
export type TransactionCategory = InferModel<typeof transactionCategories, "select">;
export type Wallet = InferModel<typeof wallets, "select">;
