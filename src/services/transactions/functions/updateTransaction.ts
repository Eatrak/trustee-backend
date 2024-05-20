import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import { UpdateTransactionResponseData } from "@APIs/output/transactions/updateTransaction";
import {
    UpdateTransactionBody,
    UpdateTransactionInput,
    UpdateTransactionPathParameters,
} from "@APIs/input/transactions/updateTransaction";
import { updateTransactionInputSchema } from "@crudValidators/transactions";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        const { userId } = Utils.getInstance().getAuthorizerClaims(event);
        const pathParameters =
            event.pathParameters as unknown as UpdateTransactionPathParameters;
        const body: UpdateTransactionBody = event.body ? JSON.parse(event.body) : {};
        const input: UpdateTransactionInput = {
            body,
            pathParameters,
            userId,
        };

        const validation = updateTransactionInputSchema.safeParse(input);
        if (!validation.success) {
            console.log("Validation failed:", validation.error);
            return Utils.getInstance().getErrorResponse(ErrorType.DATA_VALIDATION);
        }

        if (!DatabaseUtils.getInstance().getDB()) {
            // Init DB connection
            const initConnectionResponse =
                await DatabaseUtils.getInstance().initConnection();
            if (initConnectionResponse.err) {
                return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
            }
        }

        const updateTransactionResponse = await TransactionsUtils.updateTransaction(
            input,
        );
        if (updateTransactionResponse.err) {
            return Utils.getInstance().getErrorResponse(updateTransactionResponse.val);
        }

        const response: UpdateTransactionResponseData = {};
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
    }
};
