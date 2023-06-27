import "reflect-metadata";
import dayjs from 'dayjs';

import { GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { Transaction } from 'entities/transaction';
import { TransactionCategory } from "entities/transactionCategory";
import { CreateTransactionCategoryInput } from "@libs/bodies/transactions/createTransactionCategory";
import { CreateTransactionInput } from "@libs/bodies/transactions/createTransaction";
import DatabaseUtils from "./DatabaseUtils";

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
        input: CreateTransactionInput
    ): Promise<Transaction | null> {
        const {
            userId,
            categoryId,
            isIncome,
            transactionAmount,
            transactionTimestamp,
            transactionName,
            walletId
        } = input;

        // Initialize new transaction
        let newTransaction: Transaction = new Transaction();
        newTransaction.userId = userId;
        newTransaction.categoryId = categoryId;
        newTransaction.isIncome = isIncome;
        newTransaction.transactionAmount = transactionAmount;
        newTransaction.walletId = walletId;
        newTransaction.transactionName = transactionName;
        newTransaction.transactionTimestamp = transactionTimestamp;
        newTransaction.transactionCreationTimestamp = dayjs().unix();

        try {
            const createdTransaction: Transaction = await DatabaseUtils.getInstance().getEntityManager().create(newTransaction);

            return createdTransaction;
        }
        catch (err) {
            console.log(err);
            return null;
        }
    }
}
