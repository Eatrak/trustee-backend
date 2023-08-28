import dayjs from "dayjs";
import { Ok, Err, Result } from "ts-results";
import { SQL, and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";

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
    transactionCategoryRelation,
    CategoryOfTransaction,
} from "@shared/schema";
import ErrorType from "@shared/errors/list";
import { TotalBalance } from "@ts-types/transactions";
import { GetBalanceInput } from "@APIs/input/transactions/getBalance";
import { UpdateTransactionInput } from "@APIs/input/transactions/updateTransaction";
import { GetTransactionCategoryBalancesInput } from "@APIs/input/transactions/getTransactionCategories";
import { TransactionCategoryBalance } from "@ts-types/DTOs/transactions";
import { GetCategoriesOfTransactionInput } from "@APIs/input/transactions/getCategoriesOfTransaction";

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

    public static async getBalance({
        userId,
        currencyId,
        startCarriedOut,
        endCarriedOut,
    }: GetBalanceInput): Promise<Result<TotalBalance, ErrorType>> {
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
                .groupBy(transactions.isIncome);

            let totalIncome = 0;
            let totalExpense = 0;

            result.forEach((resultPart) => {
                if (resultPart.isIncome) {
                    totalIncome = resultPart.totalAmount;
                } else {
                    totalExpense = resultPart.totalAmount;
                }
            });

            const currencyTotalBalance = {
                totalIncome,
                totalExpense,
            };

            return Ok(currencyTotalBalance);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__GET_BALANCE__GENERAL);
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

    public static async getTransactionCategoryBalances({
        userId,
        startDate,
        endDate,
        wallets: walletsToFilter,
    }: GetTransactionCategoryBalancesInput): Promise<
        Result<TransactionCategoryBalance[], ErrorType>
    > {
        try {
            let walletQueryConditions: SQL[] = walletsToFilter.map((wallet) =>
                eq(wallets.id, wallet),
            );

            let result = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    id: transactionCategories.id,
                    name: transactionCategories.name,
                    userId: transactionCategories.userId,
                    income: sql<number>`SUM (CASE WHEN ${transactions.isIncome} THEN ${transactions.amount} ELSE 0 END)`,
                    expense: sql<number>`SUM (CASE WHEN ${transactions.isIncome} THEN 0 ELSE ${transactions.amount} END)`,
                })
                .from(transactionCategories)
                .innerJoin(wallets, or(...walletQueryConditions))
                .where(
                    and(
                        eq(transactionCategories.userId, userId),
                        gte(transactions.carriedOut, startDate),
                        lte(transactions.carriedOut, endDate),
                    ),
                )
                .groupBy(
                    transactionCategories.id,
                    transactionCategories.name,
                    transactionCategories.userId,
                );

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

    public static async getCategoriesOfTransaction({
        id: transactionId,
        userId,
    }: GetCategoriesOfTransactionInput): Promise<
        Result<CategoryOfTransaction[], ErrorType>
    > {
        try {
            const categoriesOfTransaction = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    id: transactionCategoryRelation.id,
                    transactionId: transactionCategoryRelation.transactionId,
                    categoryId: transactionCategoryRelation.categoryId,
                })
                .from(transactionCategoryRelation)
                .where(
                    and(
                        eq(transactionCategoryRelation.transactionId, transactionId),
                        eq(transactions.userId, userId),
                    ),
                )
                .innerJoin(
                    transactions,
                    eq(transactions.id, transactionCategoryRelation.transactionId),
                );

            return Ok(categoriesOfTransaction);
        } catch (err) {
            return Err(ErrorType.CATEGORIES_OF_TRANSACTION__GET__GENERAL);
        }
    }

    public static async createTransaction(
        id: string,
        input: CreateTransactionInput,
    ): Promise<Result<Transaction, ErrorType>> {
        try {
            const { userId, categories, isIncome, amount, carriedOut, name, walletId } =
                input;

            const transactionToCreate: Transaction = {
                id,
                userId,
                name,
                amount,
                carriedOut,
                createdAt: dayjs().unix(),
                isIncome,
                walletId,
            };

            await DatabaseUtils.getInstance()
                .getDB()
                .transaction(async (tx) => {
                    // Create transaction
                    await tx.insert(transactions).values(transactionToCreate);

                    // Create in parallel relationship items between the created transaction
                    // and its associated categories
                    await Promise.all(
                        categories.map((category) => {
                            return tx.insert(transactionCategoryRelation).values({
                                id: uuid(),
                                transactionId: id,
                                categoryId: category,
                            });
                        }),
                    );
                });

            return Ok(transactionToCreate);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__CREATE__GENERAL);
        }
    }

    public static async updateTransaction({
        id,
        userId,
        updateInfo,
    }: UpdateTransactionInput): Promise<Result<undefined, ErrorType>> {
        try {
            await DatabaseUtils.getInstance()
                .getDB()
                .update(transactions)
                .set(updateInfo)
                .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(ErrorType.TRANSACTIONS__UPDATE__GENERAL);
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
