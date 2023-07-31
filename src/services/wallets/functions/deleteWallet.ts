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
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import { DeleteWalletInput } from "@APIs/input/transactions/deleteWallet";
import { DeleteWalletsResponseData } from "@APIs/output/transactions/deleteWallet";
import { deleteWalletValidator } from "@crudValidators/wallets";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        const input = event.pathParameters as unknown as DeleteWalletInput;

        // Validate data
        const validation = new Validator({ ...input, userId }, deleteWalletValidator);
        if (validation.fails()) {
            return Utils.getInstance().getErrorResponse(
                ErrorType.WALLETS__DELETE__DATA_VALIDATION,
            );
        }

        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const deleteWalletResponse = await WalletsUtils.deleteWallet(input.id);
        if (deleteWalletResponse.err) {
            return Utils.getInstance().getErrorResponse(deleteWalletResponse.val);
        }

        const response: DeleteWalletsResponseData = {};
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
};
