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
import { getWalletInputSchema } from "@crudValidators/wallets";
import {
    GetWalletInput,
    GetWalletPathParameters,
} from "@APIs/input/transactions/getWallet";
import { GetWalletResponseData } from "@APIs/output/transactions/getWallet";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        const pathParameters = event.pathParameters as unknown as GetWalletPathParameters;
        const input: GetWalletInput = {
            ...pathParameters,
            userId,
        };

        // Validate data
        const validation = getWalletInputSchema.safeParse(input);
        if (!validation.success) {
            return Utils.getInstance().getErrorResponse(ErrorType.DATA_VALIDATION);
        }

        if (!DatabaseUtils.getInstance().getDB()) {
            // Init DB connection
            const initConnectionResponse =
                await DatabaseUtils.getInstance().initConnection();
            if (initConnectionResponse.err) {
                return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
            }
        }

        const getWalletResponse = await WalletsUtils.getWallet(pathParameters.id);
        if (getWalletResponse.err) {
            return Utils.getInstance().getErrorResponse(getWalletResponse.val);
        }

        const response: GetWalletResponseData = {
            wallet: getWalletResponse.val,
        };
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
    }

    return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
};
