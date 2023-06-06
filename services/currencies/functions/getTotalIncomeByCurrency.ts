import "reflect-metadata";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';

import Utils from 'utils/Utils';
import MonthlyWalletIncomeUtils from "utils/MonthlyWalletIncomeUtils";
import {
    GetTotalIncomeByCurrencyResponse
} from "@libs/requestInterfaces/transactions/getTotalIncomeByCurrency";
import { TotalIncomeByCurrency } from "@libs/types/transactions";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        // Get income by wallet by month
        const incomeByWalletByMonth =
            (await MonthlyWalletIncomeUtils.getIncomeByWalletByMonth(userId)).items;

        // Store the total income by currency in a dictionary
        let totalIncomeByCurrency: TotalIncomeByCurrency = {};
        for (let walletMonthlyIncome of incomeByWalletByMonth) {
            // Initialize currency total income
            if (!totalIncomeByCurrency[walletMonthlyIncome.currencyCode]) {
                totalIncomeByCurrency[walletMonthlyIncome.currencyCode] = 0;
            }

            // Sum each wallet monthly income to the currency total income
            totalIncomeByCurrency[walletMonthlyIncome.currencyCode] += walletMonthlyIncome.amount;
        }

        const response: GetTotalIncomeByCurrencyResponse = { totalIncomeByCurrency };
        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
