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
import {
    CreateTransactionBody,
    CreateTransactionInput,
} from "@APIs/input/transactions/createTransaction";
import TransactionsUtils from "@utils/TransactionsUtils";
import { createTransactionInputRules } from "@crudValidators/transactions";
import { CreateTransactionResponseData } from "@APIs/output/transactions/createTransaction";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const body: CreateTransactionBody = event.body ? JSON.parse(event.body) : {};
    const input: CreateTransactionInput = {
        ...body,
        userId,
    };

    // Validate data
    const validator = new Validator(input, createTransactionInputRules);
    if (validator.fails()) {
        return Utils.getInstance().getErrorResponse(
            ErrorType.TRANSACTIONS__CREATE__DATA_VALIDATION,
        );
    }

    try {
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const transactionId = uuid();
        const createTransactionResponse = await TransactionsUtils.createTransaction(
            transactionId,
            input,
        );
        if (createTransactionResponse.err) {
            return Utils.getInstance().getErrorResponse(createTransactionResponse.val);
        }
        const createdTransaction = createTransactionResponse.val;

        const response: CreateTransactionResponseData = {
            createdTransaction,
        };
        return Utils.getInstance().getSuccessfulResponse(201, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
    }
};
