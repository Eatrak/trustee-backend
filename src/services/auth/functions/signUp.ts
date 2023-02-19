import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

import Validator from "validatorjs";
//@ts-ignore
import en from 'validatorjs/src/lang/en';
import { ulid } from "ulid";

import { signUpEnvironmentValidator, signUpValidator } from "@crudValidators/auth";
import { SignUpBody } from "@bodies/auth/signUp";
import { Utils } from "@utils/Utils";
import UsersUtils from "@utils/UsersUtils";

// Environment variables
const USER_POOL_ID = process.env.USER_POOL_ID!;

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Check if the environment variables are set
    const environmentError = Utils.getInstance().environmentIsSet(signUpEnvironmentValidator);
    if (!environmentError) {
        return Utils.getInstance().getResponse(500, {
            message: "Server error, try later"
        });
    }

    if (!event.body) {
        return Utils.getInstance().getResponse(400, {
            message: "Body undefined"
        });
    }
    
    // Data validation
    const body: SignUpBody = JSON.parse(event.body);
    const { userInfo } = body;

    const validation = new Validator(userInfo, signUpValidator);

    if (validation.fails()) {
        return Utils.getInstance().getResponse(400, {
            message: "Invalid data sent",
            errors: validation.errors
        });
    }

    // User creation
    try {
        // Generate user ID
        const userId = ulid();
        
        // Create the user in Cognito
        const createCognitoUserResponse = await UsersUtils.createCognitoUser(USER_POOL_ID, userId, userInfo.email);

        if (!createCognitoUserResponse.User) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        
        // Set the user password in Cognito
        const setUserPasswordResponse = await UsersUtils.setCognitoUserPassword(USER_POOL_ID, userInfo.email, userInfo.password);

        if (!setUserPasswordResponse) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }

        // Create user in DynamoDB
        await UsersUtils.createDBUser(userId, userInfo.email);

        return Utils.getInstance().getResponse(201, {
            message: "User created",
            user: {
                id: userId,
                email: userInfo.email
            }
        });
    }
    catch (err) {
        console.log(err);

        return Utils.getInstance().getGeneralServerErrorResponse();
    }
};
