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
    users,
    currencies,
} from "@shared/schema";
import ErrorType from "@shared/errors/list";
import { TotalBalance } from "@ts-types/transactions";
import { GetBalanceInput } from "@APIs/input/transactions/getBalance";
import { UpdateTransactionInput } from "@APIs/input/transactions/updateTransaction";
import { GetTransactionCategoryBalancesInput } from "@APIs/input/transactions/getTransactionCategories";
import {
    TransactionCategoryBalance,
    TransactionTableRow,
} from "@ts-types/DTOs/transactions";
import { GetCategoriesOfTransactionInput } from "@APIs/input/transactions/getCategoriesOfTransaction";
import WalletsUtils from "./WalletsUtils";

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
        wallets: walletsToFilter,
    }: GetTransactionsByCurrencyAndCreationRangeInput): Promise<
        Result<TransactionTableRow[], ErrorType>
    > {
        try {
            const walletsConditions = walletsToFilter.map((walletId) =>
                eq(wallets.id, walletId),
            );

            const result: TransactionTableRow[] = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    userId: wallets.userId,
                    id: transactions.id,
                    name: transactions.name,
                    walletId: transactions.walletId,
                    carriedOut: transactions.carriedOut,
                    amount: transactions.amount,
                    isIncome: transactions.isIncome,
                    createdAt: transactions.createdAt,
                    currencyId: wallets.currencyId,
                    walletName: wallets.name,
                    currencyCode: currencies.code,
                    currencySymbol: currencies.symbol,
                    isDeleted: transactions.isDeleted,
                })
                .from(transactions)
                .where(
                    and(
                        eq(wallets.userId, userId),
                        eq(wallets.currencyId, currencyId),
                        gte(transactions.carriedOut, Number(startCarriedOut)),
                        lte(transactions.carriedOut, Number(endCarriedOut)),
                        eq(transactions.isDeleted, false),
                    ),
                )
                .innerJoin(
                    wallets,
                    and(eq(wallets.id, transactions.walletId), or(...walletsConditions)),
                )
                .innerJoin(currencies, eq(wallets.currencyId, currencies.id))
                .orderBy(desc(transactions.carriedOut))
                .limit(this.MAX_TRANSACTIONS_TO_GET);

            return Ok(result);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    public static async getBalance({
        userId,
        currencyId,
        startCarriedOut,
        endCarriedOut,
        wallets: walletsToFilter,
    }: GetBalanceInput): Promise<Result<TotalBalance, ErrorType>> {
        try {
            const walletsConditions = walletsToFilter.map((walletId) =>
                eq(wallets.id, walletId),
            );

            const result = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    totalAmount: sql<number>`cast(sum(${transactions.amount}) as float)`,
                    isIncome: transactions.isIncome,
                })
                .from(transactions)
                .innerJoin(
                    wallets,
                    and(
                        eq(wallets.id, transactions.walletId),
                        eq(wallets.currencyId, currencyId),
                        eq(wallets.userId, userId),
                        or(...walletsConditions),
                    ),
                )
                .where(
                    and(
                        gte(transactions.carriedOut, Number.parseInt(startCarriedOut)),
                        lte(transactions.carriedOut, Number.parseInt(endCarriedOut)),
                    ),
                )
                .groupBy(transactions.isIncome);

            let totalIncome = 0,
                totalExpense = 0;

            for (const total of result) {
                if (total.isIncome) totalIncome = total.totalAmount;
                else totalExpense = total.totalAmount;
            }

            return Ok({
                totalIncome,
                totalExpense,
            });
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
            // Get balances based on the given wallets;
            // if no wallets are passed, all the category balances will be 0
            const walletQueryConditions: SQL[] = walletsToFilter
                ? walletsToFilter.map((wallet) => eq(wallets.id, wallet))
                : [eq(wallets.id, "")];

            let result = await DatabaseUtils.getInstance()
                .getDB()
                .select({
                    id: transactionCategories.id,
                    name: transactionCategories.name,
                    userId: transactionCategories.userId,
                    income: sql<number>`COALESCE(SUM (CASE WHEN ${transactions.isIncome} THEN ${transactions.amount} ELSE 0 END), 0)`,
                    expense: sql<number>`COALESCE(SUM (CASE WHEN ${transactions.isIncome} THEN 0 ELSE ${transactions.amount} END), 0)`,
                })
                .from(transactionCategories)
                .leftJoin(
                    transactionCategoryRelation,
                    eq(transactionCategoryRelation.categoryId, transactionCategories.id),
                )
                .leftJoin(wallets, or(...walletQueryConditions))
                .leftJoin(
                    transactions,
                    and(
                        eq(transactionCategoryRelation.transactionId, transactions.id),
                        eq(wallets.userId, userId),
                        eq(wallets.id, transactions.walletId),
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
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
                .where(eq(transactionCategoryRelation.transactionId, transactionId))
                .innerJoin(
                    transactions,
                    eq(transactionCategoryRelation.transactionId, transactions.id),
                )
                .innerJoin(wallets, eq(wallets.id, transactions.walletId))
                .where(eq(wallets.userId, userId));

            return Ok(categoriesOfTransaction);
        } catch (err) {
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
                name,
                amount,
                carriedOut,
                createdAt: dayjs().unix(),
                isIncome,
                walletId,
                isDeleted: false,
            };

            await DatabaseUtils.getInstance()
                .getDB()
                .transaction(async (tx) => {
                    const isTheWalletOwnedByTheUser =
                        await WalletsUtils.isTheWalletOwnedByTheUser(
                            tx,
                            walletId,
                            userId,
                        );

                    // If the user doesn't own the wallet involved, the operation will be cancelled
                    if (isTheWalletOwnedByTheUser.err || !isTheWalletOwnedByTheUser.val)
                        return tx.rollback();

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
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
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
                .transaction(async (tx) => {
                    const results = await Promise.all([
                        async () => {
                            const isTheWalletOwnedByTheUser =
                                await WalletsUtils.isTheWalletOwnedByTheUser(
                                    tx,
                                    updateInfo.walletId,
                                    userId,
                                );

                            if (isTheWalletOwnedByTheUser.ok) {
                                return isTheWalletOwnedByTheUser.val;
                            }
                        },
                        async () => {
                            await tx
                                .update(transactions)
                                .set(updateInfo)
                                .where(and(eq(transactions.id, id)));
                        },
                    ]);

                    if (!results[0]) return tx.rollback();
                });

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }

    public static async deleteTransaction(
        id: string,
    ): Promise<Result<undefined, ErrorType>> {
        try {
            await DatabaseUtils.getInstance()
                .getDB()
                .update(transactions)
                .set({ isDeleted: true })
                .where(eq(transactions.id, id));

            return Ok(undefined);
        } catch (err) {
            console.log(err);
            return Err(
                DatabaseUtils.getInstance().getErrorCodeFromSQLError(
                    (err as { errno: number }).errno,
                ),
            );
        }
    }
}
