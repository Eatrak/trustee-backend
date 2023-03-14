import "reflect-metadata";

import DatabaseUtils from './DatabaseUtils';
import { GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { Transaction } from 'entities/transaction';

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
        const entityManager = DatabaseUtils.getInstance().getEntityManager();
        const response = await entityManager.find(Transaction, { userId }, {
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
}
