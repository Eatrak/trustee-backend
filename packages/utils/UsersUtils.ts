import {
    AdminCreateUserCommand,
    AdminInitiateAuthCommand,
    AdminSetUserPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";

import Utils from "utils/Utils";
import DatabaseUtils from "utils/DatabaseUtils";
import { User, users } from "schema";

export default class UsersUtils {
    /**
     * 
     * @param id User ID.
     * @param email User email.
     * @returns Command to create a user in DynamoDB.
     */
    public static async createDBUser(id: string, email: string) {
        const userToCreate: User = {
            id,
            email
        };
        await DatabaseUtils
            .getInstance()
            .getDB()
            .insert(users)
            .values(userToCreate);
    }

    /**
     * 
     * @param userPoolId Cognito user pool ID.
     * @param email User email.
     * @returns Result of cognito user creation.
     */
    public static async createCognitoUser(
        userPoolId: string,
        userId: string,
        name: string,
        surname: string,
        email: string
    ) {
        return await Utils.getInstance().getCognitoClient().send(new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [
                {
                    Name: "email",
                    Value: email
                },
                {
                    Name: "custom:name",
                    Value: name
                },
                {
                    Name: "custom:surname",
                    Value: surname
                },
                {
                    Name: "custom:id",
                    Value: userId
                }
            ],
            MessageAction: "SUPPRESS"
        }));
    }

    /**
     * 
     * @param userPoolId Cognito user pool ID.
     * @param email User email.
     * @param password User password.
     * @returns Command to set the password of the user specified.
     */
    public static async setCognitoUserPassword(userPoolId: string, email: string, password: string) {
        return await Utils.getInstance().getCognitoClient().send(new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: email,
            Password: password,
            Permanent: true
        }));
    }

    /**
     * 
     * @param userPoolId Cognito user pool ID.
     * @param clientId Cognito user pool client ID.
     * @param email User email.
     * @param password User password.
     * @returns Authentication response.
     */
    public static async authenticateUser(userPoolId: string, clientId: string, email: string, password: string) {
        return await Utils.getInstance().getCognitoClient().send(new AdminInitiateAuthCommand({
            UserPoolId: userPoolId,
            ClientId: clientId,
            AuthParameters: { USERNAME: email, PASSWORD: password },
            AuthFlow: "ADMIN_NO_SRP_AUTH"
        }));
    }
};
