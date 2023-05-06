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
import { CreateTransactionCategoryBody } from "@libs/bodies/transactions/createTransactionCategory";
import { CreateTransactionCategoryResponse } from "@libs/requestInterfaces/transactions/createTransactionCategory";
import { createTransactionCategoryRules } from "@libs/crudValidators/transactions";

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const { transactionCategoryName }: CreateTransactionCategoryBody = event.body ? JSON.parse(event.body) : {};

    // Validate data
    const validator = new Validator({ transactionCategoryName }, createTransactionCategoryRules);
    if (validator.fails()) {
        return Utils.getInstance().getResponse(404, {
            message: "Invalid data",
            errors: validator.errors
        });
    }

    try {
        const createdTransactionCategory = await TransactionsUtils.createTransactionCategory({
            userId,
            transactionCategoryName
        });

        const response: CreateTransactionCategoryResponse = { createdTransactionCategory };
        return Utils.getInstance().getResponse(201, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
