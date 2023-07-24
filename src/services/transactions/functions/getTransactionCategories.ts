import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import { GetTransactionCategoriesResponseData } from "@APIs/output/transactions/getTransactionCategories";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const getTransactionCategoriesResponse =
            await TransactionsUtils.getTransactionCategories(userId);
        if (getTransactionCategoriesResponse.err) {
            return Utils.getInstance().getErrorResponse(
                getTransactionCategoriesResponse.val,
            );
        }
        const transactionCategories = getTransactionCategoriesResponse.val;

        const responseData: GetTransactionCategoriesResponseData = {
            transactionCategories,
        };
        return Utils.getInstance().getSuccessfulResponse(200, responseData);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(
            ErrorType.TRANSACTION_CATEGORIES__CREATE__GENERAL,
        );
    }
};
