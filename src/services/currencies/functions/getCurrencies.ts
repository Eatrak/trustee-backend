import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import Utils from '@utils/Utils';
import CurrencyUtils from "@utils/CurrencyUtils";
import { GetCurrenciesResponse } from "@requestInterfaces/transactions/getCurrencies";

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const getCurrenciesResponse = (await CurrencyUtils.getCurrencies());
        if (getCurrenciesResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        const currencies = getCurrenciesResponse.val;

        const response: GetCurrenciesResponse = { currencies };
        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
