import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import { getTransactionInputSchema } from "@crudValidators/transactions";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import {
    GetTransactionInput,
    GetTransactionPathParameters,
} from "@APIs/input/transactions/getTransaction";
import { GetTransactionResponseData } from "@APIs/output/transactions/getTransaction";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const pathParameters =
        event.pathParameters as unknown as GetTransactionPathParameters;
    const input: GetTransactionInput = { pathParameters, userId };

    // Validate data
    const { success } = getTransactionInputSchema.safeParse(input);
    if (!success) {
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

        const getTransactionResponse = await TransactionsUtils.getTransaction(input);
        if (getTransactionResponse.err) {
            return Utils.getInstance().getErrorResponse(getTransactionResponse.val);
        }

        const response: GetTransactionResponseData = {
            transaction: getTransactionResponse.val,
        };
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
    }
};
