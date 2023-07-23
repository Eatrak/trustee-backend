import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";

import { signInEnvironmentValidator, signInValidator } from "@crudValidators/auth";
import Utils from "@utils/Utils";
import UsersUtils from "@utils/UsersUtils";
import { SignInBody } from "@bodies/auth/signIn";
import ErrorType from "@shared/errors/list";
import { SignInResponseData } from "@requestInterfaces/auth/signIn";

// Environment variables
const { USER_POOL_ID, USER_POOL_CLIENT_ID } = process.env;

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    // Check if the environment variables are set
    const environmentError = Utils.getInstance().environmentIsSet(
        signInEnvironmentValidator,
    );
    if (!environmentError) {
        return Utils.getInstance().getErrorResponse(ErrorType.AUTH__SIGN_IN__ENV);
    }

    const body: SignInBody = event.body ? JSON.parse(event.body) : {};

    // Data validation
    const validation = new Validator(body.userInfo, signInValidator);
    if (validation.fails()) {
        return Utils.getInstance().getErrorResponse(
            ErrorType.AUTH__SIGN_IN__DATA_VALIDATION,
        );
    }

    try {
        const { email, password } = body.userInfo;
        // User authentication
        const authenticateUserResponse = await UsersUtils.authenticateUser(
            USER_POOL_ID!,
            USER_POOL_CLIENT_ID!,
            email,
            password,
        );
        if (authenticateUserResponse.err) {
            return Utils.getInstance().getErrorResponse(authenticateUserResponse.val);
        }
        const { AuthenticationResult } = authenticateUserResponse.val;

        if (!AuthenticationResult || !AuthenticationResult.IdToken) {
            return Utils.getInstance().getErrorResponse(
                ErrorType.AUTH__SIGN_IN__READING_GENERATED_ID_TOKEN,
            );
        }

        const response: SignInResponseData = {
            authToken: AuthenticationResult.IdToken,
        };
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);

        return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
    }
};
