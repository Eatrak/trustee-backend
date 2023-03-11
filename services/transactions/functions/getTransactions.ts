import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import Utils from 'utils/Utils';
import TransactionsUtils from 'utils/TransactionsUtils';
import { ITransaction } from 'entities/transaction';
import { GetTransactionsInputQueryParams, GetTransactionsInput } from '@libs/bodies/transactions/getTransactions';
import { getTransactionsValidator } from '@libs/crudValidators/transactions';
import { GetTransactionsResponse } from '@libs/requestInterfaces/transactions/getTransactions';

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const queryParams = event.queryStringParameters as unknown as GetTransactionsInputQueryParams;

    const getTransactionsInput: GetTransactionsInput = { ...queryParams, userId };

    // Validation
    const getTransactionsValidation = new Validator(getTransactionsInput, getTransactionsValidator);
    if (getTransactionsValidation.fails()) {
        return Utils.getInstance().getResponse(400, { errors: getTransactionsValidation.errors });
    }

    try {
        let transactions: ITransaction[] = [];

        // Get user transactions by creation range
        if (getTransactionsInput.startCreationTimestamp && getTransactionsInput.endCreationTimestamp) {
            transactions = (await TransactionsUtils.getTransactionsByCreationRange(getTransactionsInput)) as ITransaction[];
        }

        const response: GetTransactionsResponse = { transactions };

        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
