import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

import Validator from "validatorjs";
//@ts-ignore
import en from 'validatorjs/src/lang/en';

import { signInEnvironmentValidator, signInValidator } from "@crudValidators/auth";
import Utils from "@utils/Utils";
import UsersUtils from "@utils/UsersUtils";
import { SignInBody } from "@bodies/auth/signIn";

// Environment variables
const { USER_POOL_ID, USER_POOL_CLIENT_ID } = process.env;

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Check if the environment variables are set
    const environmentError = Utils.getInstance().environmentIsSet(signInEnvironmentValidator);
    if (!environmentError) {
        return Utils.getInstance().getResponse(500, {
            message: "Server error, try later"
        });
    }

    // Body validation
    if (!event.body) {
        return Utils.getInstance().getResponse(400, {
            message: "Body undefined"
        });
    }

    const body: SignInBody = JSON.parse(event.body);
    
    // Data validation
    const validation = new Validator(body.userInfo, signInValidator);

    if (validation.fails()) {
        return Utils.getInstance().getResponse(400, {
            message: "Invalid data sent",
            errors: validation.errors
        });
    }
    
    try {
        const { email, password } = body.userInfo;
        // User authentication
        const response = await UsersUtils.authenticateUser(USER_POOL_ID!, USER_POOL_CLIENT_ID!, email, password);

        return Utils.getInstance().getResponse(200, {
            authToken: response.AuthenticationResult?.IdToken
        });
    }
    catch (err) {
        console.log(err);

        return Utils.getInstance().getGeneralServerErrorResponse();
    }
};
