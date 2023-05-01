import "reflect-metadata";

import { GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { Transaction } from 'entities/transaction';
import DatabaseUtils from "./DatabaseUtils";
import { TransactionCategory } from "entities/transactionCategory";

export default class TransactionsUtils {
    static MAX_TRANSACTIONS_TO_GET = 20;
    static entityManager = DatabaseUtils.getInstance().getEntityManager("transactionCategories");

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
        const response = await this.entityManager.find(Transaction, { userId }, {
            queryIndex: "GSI1",
            keyCondition: {
                GE: `CREATION<${startCreationTimestamp}>`
            },
            where: {
                transactionTimestamp: {
                    LE: endCreationTimestamp!
                }
            },
            limit: TransactionsUtils.MAX_TRANSACTIONS_TO_GET,
            cursor
        });
        return response;
    }

    public static async getTransactionCategories(userId: string) {
        const response = await this.entityManager.find(TransactionCategory, { userId });
        return response;
    }
}
