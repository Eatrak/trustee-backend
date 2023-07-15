import "reflect-metadata";
import dayjs from 'dayjs';
import { Ok, Err, Result } from "ts-results";
import { WriteTransaction, getEntityManager, getTransactionManger } from "@typedorm/core";
import { QUERY_ORDER } from "@typedorm/common";
import { eq } from "drizzle-orm";

import { GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { TransactionCategory } from "entities/transactionCategory";
import { MonthlyWalletIncome } from "entities/monthlyWalletIncome";
import { MonthlyWalletExpense } from "entities/monthlyWalletExpense";
import { CreateTransactionCategoryInput } from "@libs/bodies/transactions/createTransactionCategory";
import { CreateTransactionInput } from "@libs/bodies/transactions/createTransaction";
import DatabaseUtils from "./DatabaseUtils";
import MonthlyWalletIncomeUtils from "./MonthlyWalletIncomeUtils";
import MonthlyWalletExpenseUtils from "./MonthlyWalletExpenseUtils";
import WalletsUtils from "./WalletsUtils";
import { GetTransactionsByCurrencyInput } from "@libs/bodies/transactions/getTransactionsByCurrency";
import { DeleteTransactionInput } from "@libs/bodies/transactions/deleteTransaction";
import { GetTransactionInput } from "@libs/bodies/transactions/getTransaction";
import { transactions, Transaction } from "schema";

export type Errors = "UNEXISTING_RESOURCE" | "GENERAL";

export default class TransactionsUtils {
    static MAX_TRANSACTIONS_TO_GET = 20;

    /**
     * Get user transactions by creation range.
     *
     * @param input Necessary input used to get user transactions by creation range.
     * @returns Result of the query used to get transactions by creation range.
     */
    public static async getTransactionsByCreationRange({
        userId,
        startCreationTimestamp,
        endCreationTimestamp,
        cursor
    }: GetTransactionsInput) {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(Transaction, { userId }, {
            queryIndex: "GSI1",
            keyCondition: {
                GE: `CREATION<${startCreationTimestamp}>`
            },
            where: {
                transactionTimestamp: {
                    LE: Number.parseInt(endCreationTimestamp!)
                }
            },
            orderBy: QUERY_ORDER.DESC,
            limit: TransactionsUtils.MAX_TRANSACTIONS_TO_GET,
            cursor
        });
        return response;
    }

    /**
     * Get user transactions by currency and creation range.
     *
     * @param input Necessary input used to get user transactions by creation range.
     * @returns Result of the query used to get transactions by creation range.
     */
    public static async getTransactionsByCurrencyAndCreationRange({
        userId,
        startCreationTimestamp,
        endCreationTimestamp,
        cursor,
        currencyCode
    }: GetTransactionsByCurrencyInput) {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(Transaction, { userId, currencyCode }, {
            queryIndex: "GSI2",
            keyCondition: {
                GE: `CREATION<${startCreationTimestamp}>`
            },
            where: {
                transactionTimestamp: {
                    LE: Number.parseInt(endCreationTimestamp!)
                }
            },
            orderBy: QUERY_ORDER.DESC,
            limit: TransactionsUtils.MAX_TRANSACTIONS_TO_GET,
            cursor
        });
        return response;
    }

    public static async getTransactionCategories(userId: string) {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(TransactionCategory, { userId });
        return response;
    }

    public static async createTransactionCategory(
        input: CreateTransactionCategoryInput
    ): Promise<TransactionCategory> {
        const { userId, transactionCategoryName } = input;

        // Create new transaction category
        const newTransactionCategory = new TransactionCategory();
        newTransactionCategory.userId = userId;
        newTransactionCategory.transactionCategoryName = transactionCategoryName;
        const response: TransactionCategory = await DatabaseUtils.getInstance().getEntityManager().create(newTransactionCategory);

        return response;
    }

    public static async createTransaction(
        transactionId: string,
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
            const transactionToCreated = {
                id: transactionId,
                userId,
                name,
                amount,
                carriedOut,
                categoryId,
                createdAt: dayjs().unix(),
                isIncome,
                walletId
            };
            await DatabaseUtils
                .getInstance()
                .getDB()
                .insert(transactions)
                .values(transactionToCreate);
            
            if (createdTransaction[0].affectedRows == 0) {
                return Err("GENERAL");
            }

            return Ok({
                ...input,
                userId
            });
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }

    public static async getTransaction(
        input: GetTransactionInput
    ): Promise<Result<Transaction, Errors>> {
        try {
            const transaction = await DatabaseUtils
                .getInstance()
                .getEntityManager()
                .findOne(Transaction, input);

            if (!transaction) {
                return Err("UNEXISTING_RESOURCE");
            }

            return Ok(transaction);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }

    public static async deleteTransaction(
        transactionId: string
    ): Promise<Result<boolean, Errors>> {
        try {
            const result = await DatabaseUtils
                .getInstance()
                .getDB()
                .delete(transactions)
                .where(eq(transactions.id, transactionId));

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
