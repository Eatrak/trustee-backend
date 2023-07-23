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
import { CreateTransactionCategoryBody } from "@APIs/input/transactions/createTransactionCategory";
import { CreateTransactionCategoryResponseData } from "@APIs/output/transactions/createTransactionCategory";
import { createTransactionCategoryRules } from "@crudValidators/transactions";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const body: CreateTransactionCategoryBody = event.body ? JSON.parse(event.body) : {};

    // Validate data
    const validator = new Validator(body, createTransactionCategoryRules);
    if (validator.fails()) {
        return Utils.getInstance().getErrorResponse(
            ErrorType.TRANSACTION_CATEGORIES__CREATE__DATA_VALIDATION,
        );
    }

    try {
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const transactionCategoryId = uuid();
        const createdTransactionCategoryResponse =
            await TransactionsUtils.createTransactionCategory(transactionCategoryId, {
                userId,
                name: body.name,
            });
        if (createdTransactionCategoryResponse.err) {
            return Utils.getInstance().getErrorResponse(
                createdTransactionCategoryResponse.val,
            );
        }
        const createdTransactionCategory = createdTransactionCategoryResponse.val;

        const response: CreateTransactionCategoryResponseData = {
            createdTransactionCategory,
        };
        return Utils.getInstance().getSuccessfulResponse(201, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
    }
};
