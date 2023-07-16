import "reflect-metadata";
import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult
} from 'aws-lambda';
import Validator from 'validatorjs';
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import Utils from 'utils/Utils';
import WalletsUtils from "utils/WalletsUtils";
import { GetWalletsResponse } from "@libs/requestInterfaces/transactions/getWallets";

Validator.setMessages('en', en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        const getWalletsResponse = (await WalletsUtils.getWallets(userId));
        if (getWalletsResponse.err) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        const wallets = getWalletsResponse.val;

        const response: GetWalletsResponse = { wallets };
        return Utils.getInstance().getResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getGeneralServerErrorResponse();
};
