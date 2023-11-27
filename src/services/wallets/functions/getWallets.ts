import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";

import Utils from "@utils/Utils";
import WalletsUtils from "@utils/WalletsUtils";
import { GetWalletsResponseData } from "@APIs/output/transactions/getWallets";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import { GetWalletsInputQueryParams } from "@APIs/input/transactions/getWallets";
import { WalletViews } from "@ts-types/DTOs/wallets";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        if (!DatabaseUtils.getInstance().getDB()) {
            // Init DB connection
            const initConnectionResponse =
                await DatabaseUtils.getInstance().initConnection();
            if (initConnectionResponse.err) {
                return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
            }
        }

        const queryParams: GetWalletsInputQueryParams | null =
            event.queryStringParameters;
        const view = (queryParams && queryParams.view) || WalletViews.SUMMARY;

        let response: GetWalletsResponseData;

        switch (view) {
            // Get wallet table rows
            case WalletViews.TABLE_ROW:
                const getWalletTableRowsResponse = await WalletsUtils.getWalletTableRows(
                    userId,
                    queryParams?.currencyId,
                );
                if (getWalletTableRowsResponse.err) {
                    return Utils.getInstance().getErrorResponse(
                        getWalletTableRowsResponse.val,
                    );
                }
                response = { view, wallets: getWalletTableRowsResponse.val };
                break;
            // Get wallet with few details
            case WalletViews.SUMMARY:
                const getWalletsSummaryResponse = await WalletsUtils.getWalletsSummary(
                    userId,
                );
                if (getWalletsSummaryResponse.err) {
                    return Utils.getInstance().getErrorResponse(
                        getWalletsSummaryResponse.val,
                    );
                }
                response = { view, wallets: getWalletsSummaryResponse.val };
        }

        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
};
