import "reflect-metadata";

import { MonthlyWalletIncome } from "entities/monthlyWalletIncome";
import DatabaseUtils from "./DatabaseUtils";

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
}
