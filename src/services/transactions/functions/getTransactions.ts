import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import Utils from '@utils/Utils';
import TransactionsUtils from '@utils/TransactionsUtils';
import { GetTransactionsInputQueryParams, GetTransactionsInput } from '@bodies/transactions/getTransactions';
import { getTransactionsValidator } from '@crudValidators/transactions';
import { GetTransactionsResponse } from '@requestInterfaces/transactions/getTransactions';

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const {
        startCarriedOut,
        endCarriedOut,
        currencyId
    } = event.queryStringParameters as unknown as GetTransactionsInputQueryParams;
    const getTransactionsInput: GetTransactionsInput = {
        startCarriedOut,
        endCarriedOut,
        currencyId,
        userId
    };

    // Validate data
    const getTransactionsValidation = new Validator(getTransactionsInput, getTransactionsValidator);
    if (getTransactionsValidation.fails()) {
        return Utils.getInstance().getResponse(400, { errors: getTransactionsValidation.errors });
    }

    try {
        // Get user transactions by both creation-range and currency
        const getTransactionsResponse = await TransactionsUtils.getTransactionsByCurrencyAndCreationRange(getTransactionsInput);
        if (getTransactionsResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        const transactions = getTransactionsResponse.val;

        const response: GetTransactionsResponse = { transactions };

        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
