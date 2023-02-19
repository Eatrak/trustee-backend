import Validator from 'validatorjs';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
//@ts-ignore
import en from 'validatorjs/src/lang/en';
import "reflect-metadata";

import Utils from '@utils/Utils';
import TransactionsUtils from '@utils/TransactionsUtils';
import { GetTransactionsInputQueryParams, GetTransactionsInput } from '@bodies/transactions/getTransactions';
import { getTransactionsValidator } from '@crudValidators/transactions';
import { AuthorizerData as AuthorizerCustomClaims } from '../../../shared/types/auth';
import { ITransaction } from '../../../shared/entities/transaction';
import { GetTransactionsResponse } from '../../../shared/requestInterfaces/transactions/getTransactions';

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { "custom:id": userId } = event.requestContext.authorizer?.claims as AuthorizerCustomClaims;
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
