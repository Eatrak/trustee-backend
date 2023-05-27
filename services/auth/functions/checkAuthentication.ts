import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import jwt from "jsonwebtoken";
import jwkToPem from 'jwk-to-pem';

import Utils from "utils/Utils";
import { JsonWebKey } from "@libs/types/auth";

// Environment variables
const { USER_POOL_ID, REGION } = process.env;

const jwksURI = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;
let jsonWebKeys: JsonWebKey[] | null;

function decodeTokenHeader(token: string) {
    const [headerEncoded] = token.split('.');
    const buff = Buffer.from(headerEncoded, 'base64');
    const text = buff.toString('ascii');
    return JSON.parse(text);
}

async function getJsonWebKeyWithKID(kid: string) {
    if (!jsonWebKeys) {
        const response = await fetch(jwksURI);
        jsonWebKeys = (await response.json()).keys;
    }

    for (let jwk of jsonWebKeys!) {
        if (jwk.kid === kid) {
            return jwk;
        }
    }
    return null
}

function verifyJsonWebTokenSignature(token: string, jsonWebKey: any) {
    const pem = jwkToPem(jsonWebKey);
    const decodedToken = jwt.verify(token, pem, {algorithms: ['RS256']});
    return decodedToken;
}

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    try {
        const authToken = event.headers.Authorization!.split(" ")[1];
        const tokenHeader = decodeTokenHeader(authToken);
        const jsonWebKey = await getJsonWebKeyWithKID(tokenHeader.kid);
        const decodedAuthToken = verifyJsonWebTokenSignature(authToken, jsonWebKey);

        return Utils.getInstance().getResponse(200, {
            decodedAuthToken
        });
    }
    catch (err) {
        console.log(err);

        return Utils.getInstance().getResponse(401, {
            message: "You are not authenticated. Please, perform the login"
        });
    }
};
