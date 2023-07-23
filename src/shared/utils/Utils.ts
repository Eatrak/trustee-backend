import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import Validator from "validatorjs";

import { AuthorizerCustomClaims } from "@ts-types/auth";
import Error from "@shared/errors";
import { SuccessfulResponseBody, ErrorResponseBody } from "@shared/errors/types";
import ErrorType from "@shared/errors/list";

export default class Utils {
    private static instance?: Utils;
    private cognitoClient: CognitoIdentityProviderClient;

    private constructor() {}

    /**
     *
     * @returns Singleton istance of the Utils class.
     */
    public static getInstance() {
        if (!this.instance) {
            this.instance = new Utils();
        }

        return this.instance;
    }

    /**
     *
     * @param statusCode HTTP status code of the response.
     * @param data Body of the response.
     * @param contentType Content-Type of the response; by default it is JSON type.
     * @returns Lambda response.
     */
    public getSuccessfulResponse<SuccessfulResponseData>(
        statusCode: number,
        data: SuccessfulResponseData,
        contentType: string = "application/json",
    ): APIGatewayProxyResult {
        const body: SuccessfulResponseBody<SuccessfulResponseData> = {
            error: false,
            data,
        };

        return {
            statusCode: statusCode,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(body),
        };
    }

    public getErrorResponse(
        errorType: ErrorType,
        contentType: string = "application/json",
    ) {
        const error = new Error(errorType);

        const body: ErrorResponseBody = {
            error: true,
            data: {
                id: error.getId(),
                code: error.getCode(),
                status: error.getStatus(),
            },
        };

        return {
            statusCode: error.getStatus(),
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(body),
        };
    }

    /**
     * @returns Authorizer claims.
     */
    public getAuthorizerClaims(event: APIGatewayProxyEvent): AuthorizerCustomClaims {
        const claims = event.requestContext.authorizer?.claims;
        const customClaims = {
            userId: claims["custom:id"],
        };

        return customClaims;
    }

    public getCognitoClient() {
        if (this.cognitoClient) return this.cognitoClient;

        this.cognitoClient = new CognitoIdentityProviderClient({});
        return this.cognitoClient;
    }

    public environmentIsSet(environmentValidationRules: Validator.Rules) {
        const environmentValidation = new Validator(
            process.env,
            environmentValidationRules,
        );
        if (environmentValidation.fails()) {
            console.log("Environment variables errors", environmentValidation.errors);

            return false;
        }

        return true;
    }
}
