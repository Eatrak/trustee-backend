import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';
import { v4 as uuid } from 'uuid';

import Utils from '@utils/Utils';
import { CreateTransactionBody, CreateTransactionInput } from "@bodies/transactions/createTransaction";
import TransactionsUtils from "@utils/TransactionsUtils";
import { createTransactionInputRules } from "@crudValidators/transactions";
import { CreateTransactionResponse } from "@requestInterfaces/transactions/createTransactionResponse";
import DatabaseUtils from '@utils/DatabaseUtils';

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const body: CreateTransactionBody = event.body ? JSON.parse(event.body) : {};
    const input: CreateTransactionInput = {
        ...body,
        userId
    };

    const validator = new Validator(input, createTransactionInputRules);

    if (validator.fails()) {
        return Utils.getInstance().getResponse(404, { errors: validator.errors });
    }

    try {
        await DatabaseUtils.getInstance().initConnection();

        const transactionId = uuid();
        const createTransactionResponse = await TransactionsUtils.createTransaction(transactionId, input);

        if (createTransactionResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }

        const response: CreateTransactionResponse = {
            createdTransaction: createTransactionResponse.val
        };
        return Utils.getInstance().getResponse(201, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
