import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import { GetTransactionCategoriesResponse } from "@requestInterfaces/transactions/getTransactionCategories";
import DatabaseUtils from "@utils/DatabaseUtils";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        await DatabaseUtils.getInstance().initConnection();

        const getTransactionCategoriesResponse =
            await TransactionsUtils.getTransactionCategories(userId);
        if (getTransactionCategoriesResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        const transactionCategories = getTransactionCategoriesResponse.val;

        const response: GetTransactionCategoriesResponse = {
            transactionCategories,
        };
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
