import "reflect-metadata";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import Validator from "validatorjs";

import { AuthorizerCustomClaims } from "@libs/types/auth";

export default class Utils {
    private static instance?: Utils;
    private cognitoClient: CognitoIdentityProviderClient;

    private constructor() { }

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
     * @param body Body of the response.
     * @param contentType Content-Type of the response; by default it is JSON type.
     * @returns Lambda response.
     */
    public getResponse(statusCode: number, body: any, contentType: string = "application/json"): APIGatewayProxyResult {
        return {
            statusCode: statusCode,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify(body)
        };
    }

    /**
     * 
     * @returns Lambda response that rappresents a generic internal server error.
     */
    public getGeneralServerErrorResponse() {
        return Utils.getInstance().getResponse(500, {
            message: "Something went wrong"
        });
    }

    /**
     * @returns Authorizer claims.
     */
    public getAuthorizerClaims(event: APIGatewayProxyEvent): AuthorizerCustomClaims {
        const claims = event.requestContext.authorizer?.claims;
        const customClaims = {
            userId: claims["custom:id"]
        };

        return customClaims;
    }
    
    public getCognitoClient() {
        if (this.cognitoClient) return this.cognitoClient;
        
        this.cognitoClient = new CognitoIdentityProviderClient({});
        return this.cognitoClient;
    }

    public environmentIsSet(environmentValidationRules: Validator.Rules) {
        const environmentValidation = new Validator(process.env, environmentValidationRules);
        if (environmentValidation.fails()) {
            console.log("Environment variables errors", environmentValidation.errors);

            return false;
        }

        return true;
    }
};
