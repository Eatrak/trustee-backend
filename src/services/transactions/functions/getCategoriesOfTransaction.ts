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
import { getCategoriesOfTransactionInputRules } from "@crudValidators/transactions";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import {
    GetCategoriesOfTransactionInput,
    GetCategoriesOfTransactionInputPathParams,
} from "@APIs/input/transactions/getCategoriesOfTransaction";
import { GetCategoriesOfTransactionResponseData } from "@APIs/output/transactions/getCategoriesOfTransaction";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const { id } =
        event.pathParameters as unknown as GetCategoriesOfTransactionInputPathParams;
    const input: GetCategoriesOfTransactionInput = {
        id,
        userId,
    };

    // Validate data
    const getTransactionsValidation = new Validator(
        input,
        getCategoriesOfTransactionInputRules,
    );
    if (getTransactionsValidation.fails()) {
        return Utils.getInstance().getErrorResponse(
            ErrorType.CATEGORIES_OF_TRANSACTION__GET__DATA_VALIDATION,
        );
    }

    try {
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        // Get categories of transaction
        const queryResponse = await TransactionsUtils.getCategoriesOfTransaction(input);
        if (queryResponse.err) {
            return Utils.getInstance().getErrorResponse(queryResponse.val);
        }
        const categoriesOfTransaction = queryResponse.val;

        const response: GetCategoriesOfTransactionResponseData = {
            categoriesOfTransaction,
        };

        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
};
