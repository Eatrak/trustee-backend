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
import { updateTransactionInputRules } from "@libs/crudValidators/transactions";
import {
    UpdateTransactionBody,
    UpdateTransactionInput
} from "@libs/bodies/transactions/updateTransaction";
import { UpdateTransactionResponse } from "@libs/requestInterfaces/transactions/updateTransaction";
import DatabaseUtils from "utils/DatabaseUtils";

Validator.setMessages('en', en);
DatabaseUtils.getInstance();

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const body: UpdateTransactionBody = event.body ? JSON.parse(event.body) : {};
    const input: UpdateTransactionInput = {
        ...body,
        userId
    };

    const validator = new Validator(input, updateTransactionInputRules);

    if (validator.fails()) {
        return Utils.getInstance().getResponse(404, { errors: validator.errors });
    }

    try {
        const updateTransactionResponse = await TransactionsUtils.updateTransaction(input);

        if (updateTransactionResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }

        const response: UpdateTransactionResponse = {
            updatedTransaction: updateTransactionResponse.val
        };
        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
