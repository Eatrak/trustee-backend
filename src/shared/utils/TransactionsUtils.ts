import dayjs from "dayjs";
import { Ok, Err, Result } from "ts-results";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { CreateTransactionCategoryInput } from "@APIs/input/transactions/createTransactionCategory";
import { CreateTransactionInput } from "@APIs/input/transactions/createTransaction";
import { GetTransactionsByCurrencyAndCreationRangeInput } from "@APIs/input/transactions/getTransactionsByCurrency";
import DatabaseUtils from "@utils/DatabaseUtils";
import {
    transactions,
    Transaction,
    TransactionCategory,
    transactionCategories,
    wallets,
} from "@shared/schema";
import ErrorType from "@shared/errors/list";
import { CurrencyTotalBalance } from "@ts-types/transactions";

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
        currencyId,
    }: GetTransactionsByCurrencyAndCreationRangeInput): Promise<
        Result<Transaction[], ErrorType>
    > {
        try {
            const result: Transaction[] = await DatabaseUtils.getInstance()
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
                    createdAt: transactions.createdAt,
                })
                .from(transactions)
                .where(
                    and(
                        eq(transactions.userId, userId),
                        eq(wallets.currencyId, currencyId),
                        gte(transactions.carriedOut, Number.parseInt(startCarriedOut)),
                        lte(transactions.carriedOut, Number.parseInt(endCarriedOut)),
                    ),
                )
                .innerJoin(wallets, eq(wallets.id, transactions.walletId))
                .orderBy(desc(transactions.carriedOut))
                .limit(this.MAX_TRANSACTIONS_TO_GET);

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__GET__GENERAL);
        }
    }

    public static async getCurrencyTotalBalance({
        userId,
        currencyId,
        startCarriedOut,
        endCarriedOut,
    }: GetTransactionsByCurrencyAndCreationRangeInput): Promise<
        Result<CurrencyTotalBalance, ErrorType>
    > {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    totalAmount: sql<number>`sum(${transactions.amount})`,
                    isIncome: transactions.isIncome,
                })
                .from(transactions)
                .innerJoin(wallets, eq(wallets.id, transactions.walletId))
                .where(
                    and(
                        eq(transactions.userId, userId),
                        eq(wallets.currencyId, currencyId),
                        gte(transactions.carriedOut, Number.parseInt(startCarriedOut)),
                        lte(transactions.carriedOut, Number.parseInt(endCarriedOut)),
                    ),
                )
                .groupBy(transactions.isIncome)
                .orderBy(desc(transactions.isIncome));

            const totalIncome = result[0] ? result[0].totalAmount : 0;
            const totalExpense = result[1] ? result[1].totalAmount : 0;

            const currencyTotalBalance = {
                totalIncome,
                totalExpense,
            };

            return Ok(currencyTotalBalance);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__GET__CURRENCY_TOTAL_BALANCE);
        }
    }

    public static async getTransactionCategories(
        userId: string,
    ): Promise<Result<TransactionCategory[], ErrorType>> {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select()
                .from(transactionCategories)
                .where(eq(transactionCategories.userId, userId));

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTION_CATEGORIES__GET__GENERAL);
        }
    }

    public static async createTransactionCategory(
        id: string,
        input: CreateTransactionCategoryInput,
    ): Promise<Result<TransactionCategory, ErrorType>> {
        try {
            const { userId, name } = input;

            const transactionCategoryToCreate: TransactionCategory = {
                id,
                name,
                userId,
            };
            await DatabaseUtils.getInstance()
                .getDB()
                .insert(transactionCategories)
                .values(transactionCategoryToCreate);

            return Ok(transactionCategoryToCreate);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTION_CATEGORIES__CREATE__GENERAL);
        }
    }

    public static async createTransaction(
        id: string,
        input: CreateTransactionInput,
    ): Promise<Result<Transaction, ErrorType>> {
        try {
            const { userId, categoryId, isIncome, amount, carriedOut, name, walletId } =
                input;

            const transactionToCreate: Transaction = {
                id,
                userId,
                name,
                amount,
                carriedOut,
                categoryId,
                createdAt: dayjs().unix(),
                isIncome,
                walletId,
            };
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .insert(transactions)
                .values(transactionToCreate);

            if (result[0].affectedRows == 0) {
                return Err(ErrorType.TRANSACTIONS__CREATE__NOT_PERFORMED);
            }

            return Ok(transactionToCreate);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__CREATE__GENERAL);
        }
    }

    public static async deleteTransaction(
        id: string,
    ): Promise<Result<undefined, ErrorType>> {
        try {
            const result = await DatabaseUtils.getInstance()
                .getDB()
                .delete(transactions)
                .where(eq(transactions.id, id));

            if (result[0].affectedRows == 0) {
                return Err(ErrorType.TRANSACTIONS__DELETE__NOT_PERFORMED);
            }

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__DELETE__GENERAL);
        }
    }
}
