import "reflect-metadata";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import Utils from 'utils/Utils';
import TransactionsUtils from "utils/TransactionsUtils";
import { deleteTransactionInputRules } from "@libs/crudValidators/transactions";
import {
    DeleteTransactionInput,
    DeleteTransactionQueryParameters
} from "@libs/bodies/transactions/deleteTransaction";

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const pathParameters = event.queryStringParameters as unknown as DeleteTransactionQueryParameters;
    const input: DeleteTransactionInput = { ...pathParameters, userId };

    // Validate data
    const validator = new Validator(input, deleteTransactionInputRules);
    if (validator.fails()) {
        return Utils.getInstance().getResponse(404, { errors: validator.errors });
    }

    try {
        const deleteTransactionResponse = await TransactionsUtils.deleteTransaction(
            input.transactionId
        );

        if (deleteTransactionResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }

        return Utils.getInstance().getResponse(200, {});
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
