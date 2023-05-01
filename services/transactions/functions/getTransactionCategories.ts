import "reflect-metadata";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';

import Utils from 'utils/Utils';
import TransactionsUtils from "utils/TransactionsUtils";
import { GetTransactionCategoriesResponse } from "@libs/requestInterfaces/transactions/getTransactionCategories";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        const transactionCategories = (await TransactionsUtils.getTransactionCategories(userId)).items;

        const response: GetTransactionCategoriesResponse = { transactionCategories };
        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
