import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";
import { v4 as uuid } from "uuid";
import { Err, Ok } from "ts-results";

import Utils from "@utils/Utils";
import WalletsUtils from "@utils/WalletsUtils";
import { CreateWalletBody } from "@bodies/transactions/createWallet";
import { CreateWalletResponse } from "@requestInterfaces/transactions/createWallet";
import DatabaseUtils from "@utils/DatabaseUtils";
import Error from "@shared/errors";
import ErrorType from "@shared/errors/list";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const { name, currencyId }: CreateWalletBody = event.body
        ? JSON.parse(event.body)
        : {};

    try {
        await DatabaseUtils.getInstance().initConnection();

        const walletId = uuid();
        const createWalletResponse = await WalletsUtils.createWallet(
            walletId,
            userId,
            name,
            currencyId,
        );
        if (createWalletResponse.err) {
            const error = new Error(ErrorType.WALLETS__CREATE__GENERAL);
            return Utils.getInstance().getErrorResponse(error);
        }
        const createdWallet = createWalletResponse.val;

        return Utils.getInstance().getSuccessfulResponse(201, { createdWallet });
    } catch (err) {
        console.log(err);

        const error = new Error(ErrorType.WALLETS__CREATE__GENERAL);
        return Utils.getInstance().getErrorResponse(error);
    }
};
