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
import { CreateWalletBody } from "@bodies/transactions/createWallet";
import { CreateWalletResponse } from "@requestInterfaces/transactions/createWallet";
import DatabaseUtils from "@utils/DatabaseUtils";

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
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        const createdWallet = createWalletResponse.val;

        const response: CreateWalletResponse = { createdWallet };
        return Utils.getInstance().getResponse(201, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
