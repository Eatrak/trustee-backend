import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import Utils from 'utils/Utils';
import DatabaseUtils from "utils/DatabaseUtils";
import TransactionsUtils from 'utils/TransactionsUtils';
import { ITransaction } from 'entities/transaction';
import { GetTransactionsInputQueryParams, GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { getTransactionsValidator } from '@libs/crudValidators/transactions';
import { GetTransactionsResponse } from '@libs/requestInterfaces/transactions/getTransactions';

Validator.setMessages('en', en);
DatabaseUtils.getInstance().initTypeDormConnection();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const {
        startCreationTimestamp,
        endCreationTimestamp,
        cursor
    } = event.queryStringParameters as GetTransactionsInputQueryParams;
    const getTransactionsInput: GetTransactionsInput = {
        startCreationTimestamp,
        endCreationTimestamp,
        userId
    };
    
    // Add cursor to the request used to get the next transactions from DynamoDB
    if (cursor) getTransactionsInput.cursor = JSON.parse(cursor);

    // Validation
    const getTransactionsValidation = new Validator(getTransactionsInput, getTransactionsValidator);
    if (getTransactionsValidation.fails()) {
        return Utils.getInstance().getResponse(400, { errors: getTransactionsValidation.errors });
    }

    try {
        let transactions: ITransaction[] = [];

        // Get user transactions by creation range
        if (getTransactionsInput.startCreationTimestamp && getTransactionsInput.endCreationTimestamp) {
            const getTransactionsResponseFromDB = await TransactionsUtils.getTransactionsByCreationRange(getTransactionsInput);
            const newCursor = getTransactionsResponseFromDB.cursor;
            transactions = getTransactionsResponseFromDB.items;

            const response: GetTransactionsResponse = { transactions, cursor: newCursor };
    
            return Utils.getInstance().getResponse(200, response);
        }
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
