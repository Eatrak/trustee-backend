import "reflect-metadata";

import { MonthlyWalletExpense } from "entities/monthlyWalletExpense";
import DatabaseUtils from "./DatabaseUtils";

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
}
