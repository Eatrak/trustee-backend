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
import {
    UpdateWalletBody,
    UpdateWalletPathParameters,
    UpdateWalletInput,
} from "@APIs/input/transactions/updateWallet";
import { UpdateWalletResponseData } from "@APIs/output/transactions/updateWallet";
import { updateWalletInputRules } from "@crudValidators/wallets";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const pathParameters = event.pathParameters as unknown as UpdateWalletPathParameters;
    const body: UpdateWalletBody = event.body ? JSON.parse(event.body) : {};
    const input: UpdateWalletInput = { ...pathParameters, ...body, userId };

    try {
        // Validate data
        const validator = new Validator(input, updateWalletInputRules);
        if (validator.fails()) {
            return Utils.getInstance().getErrorResponse(ErrorType.DATA_VALIDATION);
        }

        const { id, updateInfo } = input;

        if (!DatabaseUtils.getInstance().getDB()) {
            // Init DB connection
            const initConnectionResponse =
                await DatabaseUtils.getInstance().initConnection();
            if (initConnectionResponse.err) {
                return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
            }
        }

        const updateWalletResponse = await WalletsUtils.updateWallet(
            id,
            userId,
            updateInfo,
        );
        if (updateWalletResponse.err) {
            return Utils.getInstance().getErrorResponse(updateWalletResponse.val);
        }

        const responseData: UpdateWalletResponseData = {};
        return Utils.getInstance().getSuccessfulResponse(200, responseData);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
    }
};
