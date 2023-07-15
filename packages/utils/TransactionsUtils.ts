import "reflect-metadata";
import dayjs from 'dayjs';
import { Ok, Err, Result } from "ts-results";
import { WriteTransaction, getEntityManager, getTransactionManger } from "@typedorm/core";
import { QUERY_ORDER } from "@typedorm/common";
import { v4 as uuid } from "uuid";

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
import { DeleteTransactionInput } from "@libs/bodies/transactions/deleteTransaction";
import { GetTransactionInput } from "@libs/bodies/transactions/getTransaction";
import { UpdateTransactionInput } from "@libs/bodies/transactions/updateTransaction";

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
        newTransaction.transactionId = uuid();
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

    public static async updateTransaction(
        input: UpdateTransactionInput
    ): Promise<Result<Transaction, Errors>> {
        const { attributesForSearching, updatedAttributes, userId } = input;

        // Get old transaction wallet
        const getTransactionWalletResponse = await WalletsUtils.getWallet(userId, attributesForSearching.walletId);
        if (getTransactionWalletResponse.err) {
            return Err("GENERAL");
        }
        const oldTransactionWallet = getTransactionWalletResponse.val;

        // Get transaction to update
        const pkOfTransactionToUpdate = {
            userId,
            walletId: attributesForSearching.walletId,
            currencyCode: oldTransactionWallet.currencyCode,
            transactionId: attributesForSearching.transactionId,
            transactionTimestamp: attributesForSearching.transactionTimestamp.toString()
        };
        const getOldTransactionToUpdateResponse = await this.getTransaction(pkOfTransactionToUpdate);
        if (getOldTransactionToUpdateResponse.err) {
            return Err(getOldTransactionToUpdateResponse.val);
        }
        const oldTransaction = getOldTransactionToUpdateResponse.val;

        // Initialize TypeDORM write-transaction used to update transaction
        // and update monthly-wallet-balance
        const writeTransaction = new WriteTransaction();

        // Initialize updated transaction
        let updatedTransaction: Transaction = new Transaction();
        updatedTransaction.transactionId = oldTransaction.transactionId;
        updatedTransaction.userId = userId;
        updatedTransaction.categoryId = updatedAttributes.categoryId;
        updatedTransaction.isIncome = updatedAttributes.isIncome;
        updatedTransaction.currencyCode = oldTransactionWallet.currencyCode;
        updatedTransaction.transactionAmount = updatedAttributes.transactionAmount;
        updatedTransaction.walletId = updatedAttributes.walletId;
        updatedTransaction.transactionName = updatedAttributes.transactionName;
        updatedTransaction.transactionTimestamp = updatedAttributes.transactionTimestamp;
        updatedTransaction.transactionCreationTimestamp = oldTransaction.transactionCreationTimestamp;

        // Get year of the old transaction to create
        const oldTransactionYear = dayjs.unix(oldTransaction.transactionTimestamp).get("year");
        // Get month of the old transaction to create
        const oldTransactionMonth = dayjs.unix(oldTransaction.transactionTimestamp).get("month") + 1;

        // Get year of the updated transaction to create
        const updatedTransactionYear = dayjs.unix(updatedTransaction.transactionTimestamp).get("year");
        // Get month of the updated transaction to create
        const updatedTransactionMonth = dayjs.unix(updatedTransaction.transactionTimestamp).get("month") + 1;

        const hasIncomeBeenChanged = updatedAttributes.isIncome != oldTransaction.isIncome;
        const hasTransactionCreationMonthChanged =
            oldTransactionYear != updatedTransactionYear ||
            oldTransactionMonth != updatedTransactionMonth;
        const hasAmountBeenChanged = updatedAttributes.transactionAmount != oldTransaction.transactionAmount;
        const hasWalletBeenChanged = updatedAttributes.walletId != oldTransaction.walletId;

        // If the monthly-wallet item that will contain the transaction amount will be different
        if (
            hasIncomeBeenChanged ||
            hasTransactionCreationMonthChanged ||
            hasWalletBeenChanged
        ) {
            // Get new transaction wallet
            const getNewTransactionWalletResponse = await WalletsUtils.getWallet(userId, updatedAttributes.walletId);
            if (getNewTransactionWalletResponse.err) {
                return Err("GENERAL");
            }
            const newTransactionWallet = getNewTransactionWalletResponse.val;

            // Set new transaction currency-code based on the new associated wallet
            updatedTransaction.currencyCode = newTransactionWallet.currencyCode;

            // Increase monthly-wallet-expense based on the old transaction
            if (oldTransaction.isIncome) {
                // Get monthly-wallet-income
                const getMonthlyWalletIncomeResponse = await MonthlyWalletIncomeUtils.getMonthlyWalletIncome(
                    userId,
                    oldTransactionWallet.walletId,
                    oldTransactionYear,
                    oldTransactionMonth,
                    oldTransactionWallet.currencyCode
                );

                if (!getMonthlyWalletIncomeResponse.err) {
                    // If the monthly-wallet-income item exists, its amount must be decreased
                    let updatedMonthlyWalletIncome = getMonthlyWalletIncomeResponse.val;
                    updatedMonthlyWalletIncome.amount -= oldTransaction.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletIncome,
                        {
                            userId,
                            walletId: oldTransactionWallet.walletId,
                            year: oldTransactionYear,
                            month: oldTransactionMonth,
                            currencyCode: oldTransactionWallet.currencyCode
                        },
                        updatedMonthlyWalletIncome
                    );
                }
            }
            // Decrease monthly-wallet-expense based on the old transaction
            else {
                // Get monthly-wallet-expense
                const getMonthlyWalletExpenseResponse = await MonthlyWalletExpenseUtils.getMonthlyWalletExpense(
                    userId,
                    oldTransactionWallet.walletId,
                    oldTransactionYear,
                    oldTransactionMonth,
                    oldTransactionWallet.currencyCode
                );

                if (!getMonthlyWalletExpenseResponse.err) {
                    // If the monthly-wallet-expense item exists, its amount must be decreased
                    let updatedMonthlyWalletExpense = getMonthlyWalletExpenseResponse.val;
                    updatedMonthlyWalletExpense.amount -= oldTransaction.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletExpense,
                        {
                            userId,
                            walletId: oldTransactionWallet.walletId,
                            year: oldTransactionYear,
                            month: oldTransactionMonth,
                            currencyCode: oldTransactionWallet.currencyCode
                        },
                        updatedMonthlyWalletExpense
                    );
                }
            }

            // Increase monthly-wallet-income based on the updated transaction
            if (updatedAttributes.isIncome) {
                // Get monthly-wallet-income
                const getMonthlyWalletIncomeResponse = await MonthlyWalletIncomeUtils.getMonthlyWalletIncome(
                    userId,
                    newTransactionWallet.walletId,
                    updatedTransactionYear,
                    updatedTransactionMonth,
                    newTransactionWallet.currencyCode
                );

                if (getMonthlyWalletIncomeResponse.err) {
                    // If the monthly-wallet-income item doesn't exist, it must be created
                    if (getMonthlyWalletIncomeResponse.val == "UNEXISTING_RESOURCE") {
                        // Initialize monthly-wallet-income
                        const newMonthlyWalletIncome = new MonthlyWalletIncome();
                        newMonthlyWalletIncome.currencyCode = newTransactionWallet.currencyCode;
                        newMonthlyWalletIncome.userId = userId;
                        newMonthlyWalletIncome.walletId = newTransactionWallet.walletId;
                        newMonthlyWalletIncome.year = updatedTransactionYear;
                        newMonthlyWalletIncome.month = updatedTransactionMonth;
                        newMonthlyWalletIncome.amount = updatedTransaction.transactionAmount;

                        writeTransaction.addCreateItem(newMonthlyWalletIncome);
                    }
                    else if (getMonthlyWalletIncomeResponse.val == "GENERAL") {
                        return Err("GENERAL");
                    }
                }
                else {
                    // If the monthly-wallet-income item exists, its amount must be updated
                    let updatedMonthlyWalletIncome = getMonthlyWalletIncomeResponse.val;
                    updatedMonthlyWalletIncome.amount += updatedTransaction.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletIncome,
                        {
                            userId,
                            walletId: newTransactionWallet.walletId,
                            year: updatedTransactionYear,
                            month: updatedTransactionMonth,
                            currencyCode: newTransactionWallet.currencyCode
                        },
                        updatedMonthlyWalletIncome
                    );
                }
            }
            else {
                // Get monthly-wallet-expense
                const getMonthlyWalletExpenseResponse = await MonthlyWalletExpenseUtils.getMonthlyWalletExpense(
                    userId,
                    newTransactionWallet.walletId,
                    updatedTransactionYear,
                    updatedTransactionMonth,
                    newTransactionWallet.currencyCode
                );

                if (getMonthlyWalletExpenseResponse.err) {
                    // If the monthly-wallet-expense item doesn't exist, it must be created
                    if (getMonthlyWalletExpenseResponse.val == "UNEXISTING_RESOURCE") {
                        // Initialize monthly-wallet-expense
                        const newMonthlyWalletExpense = new MonthlyWalletExpense();
                        newMonthlyWalletExpense.currencyCode = newTransactionWallet.currencyCode;
                        newMonthlyWalletExpense.userId = userId;
                        newMonthlyWalletExpense.walletId = newTransactionWallet.walletId;
                        newMonthlyWalletExpense.year = updatedTransactionYear;
                        newMonthlyWalletExpense.month = updatedTransactionMonth;
                        newMonthlyWalletExpense.amount = updatedTransaction.transactionAmount;

                        writeTransaction.addCreateItem(newMonthlyWalletExpense);
                    }
                    else if (getMonthlyWalletExpenseResponse.val == "GENERAL") {
                        return Err("GENERAL");
                    }
                }
                else {
                    // If the monthly-wallet-expense item exists, its amount must be updated
                    let updatedMonthlyWalletExpense = getMonthlyWalletExpenseResponse.val;
                    updatedMonthlyWalletExpense.amount += updatedTransaction.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletExpense,
                        {
                            userId,
                            walletId: newTransactionWallet.walletId,
                            year: updatedTransactionYear,
                            month: updatedTransactionMonth,
                            currencyCode: newTransactionWallet.currencyCode
                        },
                        updatedMonthlyWalletExpense
                    );
                }
            }
        }
        // If only the transaction amount has been changed
        else if (hasAmountBeenChanged) {
            if (oldTransaction.isIncome) {
                // Get monthly-wallet-income
                const getMonthlyWalletIncomeResponse = await MonthlyWalletIncomeUtils.getMonthlyWalletIncome(
                    userId,
                    oldTransactionWallet.walletId,
                    oldTransactionYear,
                    oldTransactionMonth,
                    oldTransactionWallet.currencyCode
                );

                if (!getMonthlyWalletIncomeResponse.err) {
                    // If the monthly-wallet-income item exists, its amount must be decreased
                    let updatedMonthlyWalletIncome = getMonthlyWalletIncomeResponse.val;
                    updatedMonthlyWalletIncome.amount -= oldTransaction.transactionAmount;
                    updatedMonthlyWalletIncome.amount += updatedTransaction.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletIncome,
                        {
                            userId,
                            walletId: oldTransactionWallet.walletId,
                            year: oldTransactionYear,
                            month: oldTransactionMonth,
                            currencyCode: oldTransactionWallet.currencyCode
                        },
                        updatedMonthlyWalletIncome
                    );
                }
            }
            else {
                // Get monthly-wallet-expense
                const getMonthlyWalletExpenseResponse = await MonthlyWalletExpenseUtils.getMonthlyWalletExpense(
                    userId,
                    oldTransactionWallet.walletId,
                    oldTransactionYear,
                    oldTransactionMonth,
                    oldTransactionWallet.currencyCode
                );

                if (!getMonthlyWalletExpenseResponse.err) {
                    // If the monthly-wallet-expense item exists, its amount must be decreased
                    let updatedMonthlyWalletExpense = getMonthlyWalletExpenseResponse.val;
                    updatedMonthlyWalletExpense.amount -= oldTransaction.transactionAmount;
                    updatedMonthlyWalletExpense.amount += updatedTransaction.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletExpense,
                        {
                            userId,
                            walletId: oldTransactionWallet.walletId,
                            year: oldTransactionYear,
                            month: oldTransactionMonth,
                            currencyCode: oldTransactionWallet.currencyCode
                        },
                        updatedMonthlyWalletExpense
                    );
                }
            }
        }

        // Make sure the transaction will be deleted and re-created when the write-transaction will be performed
        writeTransaction.addDeleteItem(
            Transaction,
            pkOfTransactionToUpdate
        );
        writeTransaction.addCreateItem(updatedTransaction);

        try {
            const result = await getTransactionManger().write(writeTransaction);

            if (!result.success) {
                return Err("GENERAL");
            }

            return Ok(updatedTransaction);
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
            const transaction = await DatabaseUtils.getInstance().getEntityManager().findOne(Transaction, input);

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
        input: DeleteTransactionInput
    ): Promise<Result<boolean, Errors>> {
        try {
            // Initialize TypeDORM write-transaction used to both delete transaction
            // and update total balance
            const writeTransaction = new WriteTransaction();
            writeTransaction.addDeleteItem(Transaction, input);

            // Get transaction
            const getTransactionResponse = await this.getTransaction(input);
            // Abort operation if transaction to delete doesn't exist
            if (getTransactionResponse.err) {
                return Err(getTransactionResponse.val);
            }
            const transactionToDelete = getTransactionResponse.val;

            // Get year of the transaction to create
            const transactionYear = dayjs.unix(transactionToDelete.transactionTimestamp).get("year");
            // Get month of the transaction to create
            const transactionMonth = dayjs.unix(transactionToDelete.transactionTimestamp).get("month") + 1;

            // Get transaction wallet
            const getTransactionWalletResponse = await WalletsUtils.getWallet(
                transactionToDelete.userId,
                transactionToDelete.walletId
            );
            if (getTransactionWalletResponse.err) {
                return Err("GENERAL");
            }
            const transactionWallet = getTransactionWalletResponse.val;

            if (transactionToDelete.isIncome) {
                // Get monthly-wallet-income
                const getMonthlyWalletIncomeResponse = await MonthlyWalletIncomeUtils.getMonthlyWalletIncome(
                    transactionToDelete.userId,
                    transactionToDelete.walletId,
                    transactionYear,
                    transactionMonth,
                    transactionWallet.currencyCode
                );
    
                if (!getMonthlyWalletIncomeResponse.err) {
                    // If the monthly-wallet-income item exists, its amount must be updated
                    let updatedMonthlyWalletIncome = getMonthlyWalletIncomeResponse.val;
                    updatedMonthlyWalletIncome.amount -= transactionToDelete.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletIncome,
                        {
                            userId: transactionToDelete.userId,
                            walletId: transactionToDelete.walletId,
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
                    transactionToDelete.userId,
                    transactionToDelete.walletId,
                    transactionYear,
                    transactionMonth,
                    transactionWallet.currencyCode
                );
    
                if (!getMonthlyWalletExpenseResponse.err) {
                    // If the monthly-wallet-expense item exists, its amount must be updated
                    let updatedMonthlyWalletExpense = getMonthlyWalletExpenseResponse.val;
                    updatedMonthlyWalletExpense.amount -= transactionToDelete.transactionAmount;
                    writeTransaction.addUpdateItem(
                        MonthlyWalletExpense,
                        {
                            userId: transactionToDelete.userId,
                            walletId: transactionToDelete.walletId,
                            year: transactionYear,
                            month: transactionMonth,
                            currencyCode: transactionWallet.currencyCode
                        },
                        updatedMonthlyWalletExpense
                    );
                }
            }

            const result = await getTransactionManger().write(writeTransaction);
            if (!result.success) {
                return Err("GENERAL");
            }
            
            return Ok(true);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }
}
