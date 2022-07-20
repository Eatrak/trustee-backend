import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";

import Validator from "validatorjs";
//@ts-ignore
import en from 'validatorjs/src/lang/en';
import { ulid } from "ulid";

import { createUserValidation } from "@crudRules/auth";
import { SignUpBody } from "@bodies/auth/signUp";
import { Utils } from "@utils/Utils";
import UsersUtils from "@utils/UsersUtils";

// Environment variables
const { REGION, USER_POOL_ID } = process.env;

Validator.setMessages("en", en);

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Check if the environment variables are set
    if (!REGION || !USER_POOL_ID) {
        console.log("Region or user pool id are missing");
        console.log("Region: " + REGION);
        console.log("User pool id: " + USER_POOL_ID);

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

    const validation = new Validator(userInfo, createUserValidation);

    if (validation.fails()) {
        return Utils.getInstance().getResponse(400, {
            message: "Invalid data sent",
            errors: validation.errors
        });
    }

    // User creation
    try {
        // Create the user in Cognito
        const createCognitoUserResponse = await UsersUtils.createCognitoUser(USER_POOL_ID, userInfo.email);

        if (!createCognitoUserResponse.User) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }
        
        // Set the user password in Cognito
        const setUserPasswordResponse = await UsersUtils.setCognitoUserPassword(USER_POOL_ID, userInfo.email, userInfo.password);

        if (!setUserPasswordResponse) {
            return Utils.getInstance().getGeneralServerErrorResponse();
        }

        // Generate user ID
        const userId = ulid();

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
