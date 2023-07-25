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
import WalletsUtils from "@utils/WalletsUtils";
import { CreateWalletBody } from "@APIs/input/transactions/createWallet";
import { CreateWalletResponseData } from "@APIs/output/transactions/createWallet";
import DatabaseUtils from "@utils/DatabaseUtils";
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
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const walletId = uuid();
        const createWalletResponse = await WalletsUtils.createWallet(
            walletId,
            userId,
            name,
            currencyId,
        );
        if (createWalletResponse.err) {
            return Utils.getInstance().getErrorResponse(createWalletResponse.val);
        }
        const createdWallet = createWalletResponse.val;

        const responseData: CreateWalletResponseData = { createdWallet };
        return Utils.getInstance().getSuccessfulResponse(201, responseData);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.WALLETS__CREATE__GENERAL);
    }
};
