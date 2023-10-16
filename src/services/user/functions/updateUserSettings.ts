import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";

import Utils from "@utils/Utils";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import {
    UpdateUserSettingsBody,
    UpdateUserSettingsInput,
} from "@APIs/input/user/updateUserSettings";
import { updateUserSettingsInputRules } from "@crudValidators/user";
import UserUtils from "@utils/UserUtils";
import { UpdateUserSettingsResponseData } from "@APIs/output/user/updateUserSettings";

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);
    const body: UpdateUserSettingsBody = event.body ? JSON.parse(event.body) : {};
    const input: UpdateUserSettingsInput = {
        ...body,
        userId,
    };

    // Validate data
    const validator = new Validator(input, updateUserSettingsInputRules);
    if (validator.fails()) {
        return Utils.getInstance().getErrorResponse(ErrorType.DATA_VALIDATION);
    }

    try {
        if (!DatabaseUtils.getInstance().getDB()) {
            // Init DB connection
            const initConnectionResponse =
                await DatabaseUtils.getInstance().initConnection();
            if (initConnectionResponse.err) {
                return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
            }
        }

        const updateUserSettingsResponse = await UserUtils.updateUserSettings(input);
        if (updateUserSettingsResponse.err) {
            return Utils.getInstance().getErrorResponse(updateUserSettingsResponse.val);
        }

        const response: UpdateUserSettingsResponseData = {};
        return Utils.getInstance().getSuccessfulResponse(201, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
    }
};
