import { APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import Validator from "validatorjs";

export class Utils {
    private static instance: Utils = new Utils();
    private dbClient: DynamoDBClient;
    private cognitoClient: CognitoIdentityProviderClient;

    private constructor() { }

    /**
     * 
     * @returns Singleton istance of the Utils class.
     */
    public static getInstance() {
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
     * 
     * @returns DynamoDB connection string.
     */
    public getDBClient(): DynamoDBClient {
        if (this.dbClient) return this.dbClient;
        
        this.dbClient = new DynamoDBClient({});
        return this.dbClient;
    }
    
    /**
     * 
     * @returns DynamoDB table name.
     */
     public getTableName(): string {
        return "trustee";
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
