import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";

import Utils from "@utils/Utils";
import CurrencyUtils from "@utils/CurrencyUtils";
import { GetCurrenciesResponseData } from "@APIs/output/transactions/getCurrencies";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const getCurrenciesResponse = await CurrencyUtils.getCurrencies();
        if (getCurrenciesResponse.err) {
            return Utils.getInstance().getErrorResponse(getCurrenciesResponse.val);
        }
        const currencies = getCurrenciesResponse.val;

        const response: GetCurrenciesResponseData = { currencies };
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(ErrorType.CURRENCIES__GET__GENERAL);
};
