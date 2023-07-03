import "reflect-metadata";
import dayjs from 'dayjs';
import { Ok, Err, Result } from "ts-results";
import { WriteTransaction, getTransactionManger } from "@typedorm/core";
import { QUERY_ORDER } from "@typedorm/common";

import { GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { Transaction } from 'entities/transaction';
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
        input: CreateTransactionInput
    ): Promise<Result<Transaction, "GENERAL">> {
        const {
            userId,
            categoryId,
            isIncome,
            transactionAmount,
            transactionTimestamp,
            transactionName,
            walletId
        } = input;

        // Get transaction wallet
        const getTransactionWalletResponse = await WalletsUtils.getWallet(userId, walletId);
        if (getTransactionWalletResponse.err) {
            return Err("GENERAL");
        }
        const transactionWallet = getTransactionWalletResponse.val;

        // Initialize new transaction
        let newTransaction: Transaction = new Transaction();
        newTransaction.userId = userId;
        newTransaction.categoryId = categoryId;
        newTransaction.isIncome = isIncome;
        newTransaction.currencyCode = transactionWallet.currencyCode;
        newTransaction.transactionAmount = transactionAmount;
        newTransaction.walletId = walletId;
        newTransaction.transactionName = transactionName;
        newTransaction.transactionTimestamp = transactionTimestamp;
        newTransaction.transactionCreationTimestamp = dayjs().unix();

        // Get year of the transaction to create
        const transactionYear = dayjs.unix(newTransaction.transactionTimestamp).get("year");
        // Get month of the transaction to create
        const transactionMonth = dayjs.unix(newTransaction.transactionTimestamp).get("month") + 1;

        // Initialize TypeDORM write-transaction used to both create transaction
        // and update monthly-wallet-income
        const writeTransaction = new WriteTransaction();
        writeTransaction.addCreateItem(newTransaction);

        if (newTransaction.isIncome) {
            // Get monthly-wallet-income
            const getMonthlyWalletIncomeResponse = await MonthlyWalletIncomeUtils.getMonthlyWalletIncome(
                userId,
                walletId,
                transactionYear,
                transactionMonth,
                transactionWallet.currencyCode
            );

            if (getMonthlyWalletIncomeResponse.err) {
                // If the monthly-wallet-income item doesn't exist, it must be created
                if (getMonthlyWalletIncomeResponse.val == "UNEXISTING_RESOURCE") {
                    // Initialize monthly-wallet-income
                    const newMonthlyWalletIncome = new MonthlyWalletIncome();
                    newMonthlyWalletIncome.currencyCode = transactionWallet.currencyCode;
                    newMonthlyWalletIncome.userId = newTransaction.userId;
                    newMonthlyWalletIncome.walletId = transactionWallet.walletId;
                    newMonthlyWalletIncome.year = transactionYear;
                    newMonthlyWalletIncome.month = transactionMonth;
                    newMonthlyWalletIncome.amount = newTransaction.transactionAmount;

                    writeTransaction.addCreateItem(newMonthlyWalletIncome);
                }
                else if (getMonthlyWalletIncomeResponse.val == "GENERAL") {
                    return Err("GENERAL");
                }
            }
            else {
                // If the monthly-wallet-income item exists, its amount must be updated
                let updatedMonthlyWalletIncome = getMonthlyWalletIncomeResponse.val;
                updatedMonthlyWalletIncome.amount += newTransaction.transactionAmount;
                writeTransaction.addUpdateItem(
                    MonthlyWalletIncome,
                    {
                        userId,
                        walletId,
                        year: transactionYear,
                        month: transactionMonth,
                        currencyCode: transactionWallet.currencyCode
                    },
                    updatedMonthlyWalletIncome
                );
            }
        }
        else {
            // Get monthly-wallet-expense
            const getMonthlyWalletExpenseResponse = await MonthlyWalletExpenseUtils.getMonthlyWalletExpense(
                userId,
                walletId,
                transactionYear,
                transactionMonth,
                transactionWallet.currencyCode
            );

            if (getMonthlyWalletExpenseResponse.err) {
                // If the monthly-wallet-expense item doesn't exist, it must be created
                if (getMonthlyWalletExpenseResponse.val == "UNEXISTING_RESOURCE") {
                    // Initialize monthly-wallet-expense
                    const newMonthlyWalletExpense = new MonthlyWalletExpense();
                    newMonthlyWalletExpense.currencyCode = transactionWallet.currencyCode;
                    newMonthlyWalletExpense.userId = newTransaction.userId;
                    newMonthlyWalletExpense.walletId = transactionWallet.walletId;
                    newMonthlyWalletExpense.year = transactionYear;
                    newMonthlyWalletExpense.month = transactionMonth;
                    newMonthlyWalletExpense.amount = newTransaction.transactionAmount;

                    writeTransaction.addCreateItem(newMonthlyWalletExpense);
                }
                else if (getMonthlyWalletExpenseResponse.val == "GENERAL") {
                    return Err("GENERAL");
                }
            }
            else {
                // If the monthly-wallet-expense item exists, its amount must be updated
                let updatedMonthlyWalletExpense = getMonthlyWalletExpenseResponse.val;
                updatedMonthlyWalletExpense.amount += newTransaction.transactionAmount;
                writeTransaction.addUpdateItem(
                    MonthlyWalletExpense,
                    {
                        userId,
                        walletId,
                        year: transactionYear,
                        month: transactionMonth,
                        currencyCode: transactionWallet.currencyCode
                    },
                    updatedMonthlyWalletExpense
                );
            }
        }

        try {
            const result = await getTransactionManger().write(writeTransaction);
            
            if (!result.success) {
                return Err("GENERAL");
            }

            return Ok(newTransaction);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }
}
