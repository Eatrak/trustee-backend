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
import { getBalanceValidator } from "@crudValidators/transactions";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import {
    GetBalanceInput,
    GetBalanceInputMultiQueryParams,
    GetBalanceInputQueryParams,
} from "@APIs/input/transactions/getBalance";
import { GetBalanceResponseData } from "@APIs/output/transactions/getBalance";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const { startCarriedOut, endCarriedOut, currencyId } =
        event.queryStringParameters as unknown as GetBalanceInputQueryParams;
    const { wallets } =
        event.multiValueQueryStringParameters as unknown as GetBalanceInputMultiQueryParams;
    const input: GetBalanceInput = {
        startCarriedOut,
        endCarriedOut,
        currencyId,
        userId,
        wallets,
    };

    // Validate data
    const validation = new Validator(input, getBalanceValidator);
    if (validation.fails()) {
        return Utils.getInstance().getErrorResponse(
            ErrorType.TRANSACTIONS__GET__DATA_VALIDATION,
        );
    }

    try {
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const getBalanceResponse = await TransactionsUtils.getBalance(input);
        if (getBalanceResponse.err) {
            return Utils.getInstance().getErrorResponse(getBalanceResponse.val);
        }
        const balance = getBalanceResponse.val;

        const response: GetBalanceResponseData = balance;
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(
        ErrorType.TRANSACTIONS__GET_BALANCE__GENERAL,
    );
};
