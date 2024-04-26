import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import {
    GetTransactionsInputQueryParams,
    GetTransactionsInput,
    GetTransactionsInputMultiQueryParams,
} from "@APIs/input/transactions/getTransactions";
import { getTransactionsValidator } from "@crudValidators/transactions";
import { GetTransactionsResponseData } from "@APIs/output/transactions/getTransactions";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const { startCarriedOut, endCarriedOut, currencyId } =
        event.queryStringParameters as unknown as GetTransactionsInputQueryParams;
    const { wallets = [] } =
        event.multiValueQueryStringParameters as unknown as GetTransactionsInputMultiQueryParams;
    const getTransactionsInput: GetTransactionsInput = {
        startCarriedOut,
        endCarriedOut,
        currencyId,
        userId,
        wallets,
    };

    // Validate data
    const getTransactionsValidation = new Validator(
        getTransactionsInput,
        getTransactionsValidator,
    );
    if (getTransactionsValidation.fails()) {
        return Utils.getInstance().getErrorResponse(ErrorType.DATA_VALIDATION);
    }

    try {
        if (!DatabaseUtils.getInstance().getDB()) {
            // Init DB connection
            const initConnectionResponse =
                await DatabaseUtils.getInstance().initConnection();
            if (initConnectionResponse.err) {
                return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
            }
        }

        // Get user transactions by both creation-range and currency
        const getTransactionsResponse =
            await TransactionsUtils.getTransactionsByCurrencyAndCreationRange(
                getTransactionsInput,
            );
        if (getTransactionsResponse.err) {
            return Utils.getInstance().getErrorResponse(getTransactionsResponse.val);
        }
        const transactions = getTransactionsResponse.val;

        const response: GetTransactionsResponseData = {
            transactions,
        };

        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
};
