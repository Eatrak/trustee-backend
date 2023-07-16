import "reflect-metadata";
import dayjs from 'dayjs';
import { Ok, Err, Result } from "ts-results";
import { desc, eq, gte, lte } from "drizzle-orm";

import { CreateTransactionCategoryInput } from "@libs/bodies/transactions/createTransactionCategory";
import { CreateTransactionInput } from "@libs/bodies/transactions/createTransaction";
import { GetTransactionsByCurrencyAndCreationRangeInput } from "@libs/bodies/transactions/getTransactionsByCurrency";
import DatabaseUtils from "utils/DatabaseUtils";
import { transactions, Transaction, TransactionCategory, transactionCategories, wallets, currencies } from "schema";

export type Errors = "UNEXISTING_RESOURCE" | "GENERAL";

export default class TransactionsUtils {
    static MAX_TRANSACTIONS_TO_GET = 30;

    /**
     * Get user transactions by currency and creation range.
     *
     * @param input Necessary input used to get user transactions by creation range.
     * @returns Result of the query used to get transactions by creation range.
     */
    public static async getTransactionsByCurrencyAndCreationRange({
        userId,
        startCarriedOut,
        endCarriedOut,
        currencyId
    }: GetTransactionsByCurrencyAndCreationRangeInput): Promise<Result<Transaction[], "GENERAL">> {
        try {
            const result: Transaction[] = await DatabaseUtils
                .getInstance()
                .getDB()
                .select({
                    userId: transactions.userId,
                    id: transactions.id,
                    name: transactions.name,
                    walletId: transactions.walletId,
                    categoryId: transactions.categoryId,
                    carriedOut: transactions.carriedOut,
                    amount: transactions.amount,
                    isIncome: transactions.isIncome,
                    createdAt: transactions.createdAt
                })
                .from(transactions)
                .where(eq(transactions.userId, userId))
                .where(eq(wallets.currencyId, currencyId))
                .where(gte(transactions.carriedOut, Number.parseInt(startCarriedOut)))
                .where(lte(transactions.carriedOut, Number.parseInt(endCarriedOut)))
                .innerJoin(wallets, eq(wallets.id, transactions.walletId))
                .orderBy(desc(transactions.carriedOut))
                .limit(this.MAX_TRANSACTIONS_TO_GET);

            return Ok(result);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }

    public static async getTransactionCategories(userId: string) {
        return await DatabaseUtils
            .getInstance()
            .getDB()
            .select()
            .from(transactionCategories)
            .where(eq(transactionCategories.userId, userId));
    }

    public static async createTransactionCategory(
        id: string,
        input: CreateTransactionCategoryInput
    ): Promise<Result<TransactionCategory, "GENERAL">> {
        try {
            const { userId, name } = input;

            const transactionCategoryToCreate: TransactionCategory = {
                id,
                name,
                userId
            };
            await DatabaseUtils
                .getInstance()
                .getDB()
                .insert(transactionCategories)
                .values(transactionCategoryToCreate);

            return Ok(transactionCategoryToCreate);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }

    public static async createTransaction(
        id: string,  
        input: CreateTransactionInput
    ): Promise<Result<Transaction, "GENERAL">> {
        const {
            userId,
            categoryId,
            isIncome,
            amount,
            carriedOut,
            name,
            walletId
        } = input;

        try {
            const transactionToCreate: Transaction = {
                id,
                userId,
                name,
                amount,
                carriedOut,
                categoryId,
                createdAt: dayjs().unix(),
                isIncome,
                walletId
            };
            const result = await DatabaseUtils
                .getInstance()
                .getDB()
                .insert(transactions)
                .values(transactionToCreate);
            
            if (result[0].affectedRows == 0) {
                return Err("GENERAL");
            }

            return Ok(transactionToCreate);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }

    public static async deleteTransaction(
        id: string
    ): Promise<Result<boolean, Errors>> {
        try {
            const result = await DatabaseUtils
                .getInstance()
                .getDB()
                .delete(transactions)
                .where(eq(transactions.id, id));

            if (result[0].affectedRows == 0) {
                return Err("UNEXISTING_RESOURCE");
            }
            
            return Ok(true);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }
}
