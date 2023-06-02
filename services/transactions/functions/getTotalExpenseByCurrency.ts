import "reflect-metadata";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';

import Utils from 'utils/Utils';
import {
    GetTotalExpenseByCurrencyResponse
} from "@libs/requestInterfaces/transactions/getTotalExpenseByCurrency";
import { TotalExpenseByCurrency } from "@libs/types/transactions";
import MonthlyWalletExpenseUtils from "utils/MonthlyWalletExpenseUtils";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        // Get expense by wallet by month
        const expenseByWalletByMonth =
            (await MonthlyWalletExpenseUtils.getExpenseByWalletByMonth(userId)).items;

        // Store the total expense by currency in a dictionary
        let totalExpenseByCurrency: TotalExpenseByCurrency = {};
        for (let walletMonthlyExpense of expenseByWalletByMonth) {
            // Initialize currency total expense
            if (!totalExpenseByCurrency[walletMonthlyExpense.currencyCode]) {
                totalExpenseByCurrency[walletMonthlyExpense.currencyCode] = 0;
            }

            // Sum each wallet monthly expense to the currency total expense
            totalExpenseByCurrency[walletMonthlyExpense.currencyCode] += walletMonthlyExpense.amount;
        }

        const response: GetTotalExpenseByCurrencyResponse = { totalExpenseByCurrency };
        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
