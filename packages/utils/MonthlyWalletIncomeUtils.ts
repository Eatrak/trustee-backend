import "reflect-metadata";
import { Ok, Err, Result } from "ts-results";

import { MonthlyWalletIncome } from "entities/monthlyWalletIncome";
import DatabaseUtils from "./DatabaseUtils";

export type Errors = "UNEXISTING_RESOURCE" | "GENERAL";

export default class MonthlyWalletIncomeUtils {
    /**
     * Get income of each month of each wallet.
     *
     * @param userId ID of the user that owns the wallets.
     * @returns Result of the query used to get the income of
     * each month of each wallet.
     */
    public static async getIncomeByWalletByMonth(
        userId: string
    ) {
        const response = await DatabaseUtils.getInstance().getEntityManager().find(
            MonthlyWalletIncome,
            { userId },
            { queryIndex: "GSI1" }
        );
        return response;
    }

    /**
     * Get monthly-wallet-income.
     * 
     * @param userId ID of the user.
     * @param walletId ID of a user wallet.
     * @param year Year of the wallet income.
     * @param month Month of the wallet income.
     * @returns Monthly-wallet-income.
     */
    public static async getMonthlyWalletIncome(
        userId: string,
        walletId: string,
        year: number,
        month: number,
        currencyCode: string
    ): Promise<Result<MonthlyWalletIncome, Errors>> {
        try {
            // Get monthly-wallet-income
            const monthlyWalletIncome = await DatabaseUtils.getInstance().getEntityManager().findOne(
                MonthlyWalletIncome,
                { userId, walletId, year, month, currencyCode }
            );

            // Abort if the monthly-wallet-income doesn't exist
            if (!monthlyWalletIncome) {
                return Err("UNEXISTING_RESOURCE");
            }

            return Ok(monthlyWalletIncome);
        }
        catch (err) {
            console.log(err);
            return Err("GENERAL");
        }
    }
}
