import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";
import { v4 as uuid } from "uuid";

import { signUpEnvironmentValidator, signUpValidator } from "@crudValidators/auth";
import { SignUpBody } from "@bodies/auth/signUp";
import Utils from "@utils/Utils";
import UsersUtils from "@utils/UsersUtils";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import { SignUpResponseData } from "@requestInterfaces/auth/signUp";

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID!;

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    // Check if the environment variables are set
    const environmentError = Utils.getInstance().environmentIsSet(
        signUpEnvironmentValidator,
    );
    if (!environmentError) {
        return Utils.getInstance().getErrorResponse(ErrorType.AUTH__SIGN_UP__ENV);
    }

    // Data validation
    const body: SignUpBody = event.body ? JSON.parse(event.body) : {};

    const validation = new Validator(body.userInfo, signUpValidator);
    const { name, email, password, surname } = body.userInfo;

    if (validation.fails()) {
        console.log(validation.errors);

        return Utils.getInstance().getErrorResponse(
            ErrorType.AUTH__SIGN_UP__DATA_VALIDATION,
        );
    }

    // User creation
    try {
        // Generate user ID
        const userId = uuid();

        // Create the user in Cognito
        const createCognitoUserResponse = await UsersUtils.createCognitoUser(
            USER_POOL_ID,
            userId,
            name,
            surname,
            email,
        );
        if (createCognitoUserResponse.err) {
            return Utils.getInstance().getErrorResponse(createCognitoUserResponse.val);
        }

        // Set the user password in Cognito
        const setUserPasswordResponse = await UsersUtils.setCognitoUserPassword(
            USER_POOL_ID,
            email,
            password,
        );
        if (setUserPasswordResponse.err) {
            return Utils.getInstance().getErrorResponse(setUserPasswordResponse.val);
        }

        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        // Create user in the DB
        const createDBUserResponse = await UsersUtils.createDBUser(
            userId,
            email,
            name,
            surname,
        );
        if (createDBUserResponse.err) {
            return Utils.getInstance().getErrorResponse(createDBUserResponse.val);
        }
        const createdUser = createDBUserResponse.val;

        return Utils.getInstance().getSuccessfulResponse<SignUpResponseData>(201, {
            createdUser,
        });
    } catch (err) {
        console.log(err);

        return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
    }
};
