import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";
import { v4 as uuid } from "uuid";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import { CreateTransactionCategoryBody } from "@bodies/transactions/createTransactionCategory";
import { CreateTransactionCategoryResponse } from "@requestInterfaces/transactions/createTransactionCategory";
import { createTransactionCategoryRules } from "@crudValidators/transactions";
import DatabaseUtils from "@utils/DatabaseUtils";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const { name }: CreateTransactionCategoryBody = event.body
        ? JSON.parse(event.body)
        : {};

    // Validate data
    const validator = new Validator({ name }, createTransactionCategoryRules);
    if (validator.fails()) {
        return Utils.getInstance().getResponse(404, {
            message: "Invalid data",
            errors: validator.errors,
        });
    }

    try {
        await DatabaseUtils.getInstance().initConnection();

        const transactionCategoryId = uuid();
        const createdTransactionCategoryResponse =
            await TransactionsUtils.createTransactionCategory(transactionCategoryId, {
                userId,
                name,
            });

        if (createdTransactionCategoryResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        const createdTransactionCategory = createdTransactionCategoryResponse.val;

        const response: CreateTransactionCategoryResponse = {
            createdTransactionCategory,
        };
        return Utils.getInstance().getResponse(201, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
