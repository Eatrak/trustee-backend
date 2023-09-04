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
import { deleteTransactionInputRules } from "@crudValidators/transactions";
import {
    DeleteTransactionInput,
    DeleteTransactionQueryParameters,
} from "@APIs/input/transactions/deleteTransaction";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import { DeleteTransactionResponseData } from "@APIs/output/transactions/deleteTransaction";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const pathParameters =
        event.queryStringParameters as unknown as DeleteTransactionQueryParameters;
    const input: DeleteTransactionInput = { ...pathParameters, userId };

    // Validate data
    const validator = new Validator(input, deleteTransactionInputRules);
    if (validator.fails()) {
        return Utils.getInstance().getErrorResponse(
            ErrorType.TRANSACTIONS__DELETE__DATA_VALIDATION,
        );
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

        const deleteTransactionResponse = await TransactionsUtils.deleteTransaction(
            input.id,
        );
        if (deleteTransactionResponse.err) {
            return Utils.getInstance().getErrorResponse(deleteTransactionResponse.val);
        }

        const response: DeleteTransactionResponseData = {};
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
    }
};
