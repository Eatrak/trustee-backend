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
import { CreateTransactionBody, CreateTransactionInput } from "@libs/bodies/transactions/createTransaction";
import TransactionsUtils from "utils/TransactionsUtils";
import { createTransactionInputRules } from "@libs/crudValidators/transactions";
import { CreateTransactionResponse } from "@libs/requestInterfaces/transactions/createTransactionResponse";

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
        const createdTransaction = await TransactionsUtils.createTransaction(input);

        if (createdTransaction) {
            const response: CreateTransactionResponse = { createdTransaction };
            return Utils.getInstance().getResponse(201, response);
        }
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
