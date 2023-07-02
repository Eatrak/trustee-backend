import "reflect-metadata";
import { Ok, Err, Result } from "ts-results";

import { MonthlyWalletExpense } from "entities/monthlyWalletExpense";
import DatabaseUtils from "./DatabaseUtils";

export type Errors = "UNEXISTING_RESOURCE" | "GENERAL";

export default class MonthlyWalletExpenseUtils {
    /**
     * Get expense of each month of each wallet.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get the expense of
     * each month of each wallet.
     */
    public static async getExpenseByWalletByMonth(
        userId: string
    ) {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(
            MonthlyWalletExpense,
            { userId },
            { queryIndex: "GSI1" }
        );
        return response;
    }

    /**
     * Get monthly-wallet-expense.
     * 
     * @param userId ID of the user.
     * @param walletId ID of a user wallet.
     * @param year Year of the wallet expense.
     * @param month Month of the wallet expense.
     * @returns Monthly-wallet-expense.
     */
    public static async getMonthlyWalletExpense(
        userId: string,
        walletId: string,
        year: number,
        month: number
    ): Promise<Result<MonthlyWalletExpense, Errors>> {
        try {
            // Get monthly-wallet-expense
            const monthlyWalletExpense = await DatabaseUtils.getInstance().getEntityManager().findOne(
                MonthlyWalletExpense,
                { userId, walletId, year, month }
            );

            // Abort if the monthly-wallet-expense doesn't exist
            if (!monthlyWalletExpense) {
                return Err("UNEXISTING_RESOURCE");
            }

            return Ok(monthlyWalletExpense);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }
}
