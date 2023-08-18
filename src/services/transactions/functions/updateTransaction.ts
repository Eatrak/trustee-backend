import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator, { Validator as ValidatorType } from "validatorjs";
//@ts-ignore
import en from "validatorjs/src/lang/en";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import { updateTransactionInputRules } from "@crudValidators/transactions";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import {
    UpdateTransactionBody,
    UpdateTransactionInput,
    UpdateTransactionPathParameters,
} from "@APIs/input/transactions/updateTransaction";
import { UpdateTransactionResponseData } from "@APIs/output/transactions/updateTransaction";

Validator.setMessages("en", en);
function getValue(obj: any, key: string) {
    const keys = key.split(".");
    let current = obj;
    for (const k of keys) {
        if (current[k] === undefined) {
            return undefined;
        }
        current = current[k];
    }
    return current;
}
export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    try {
        const { userId } = Utils.getInstance().getAuthorizerClaims(event);
        const pathParameters =
            event.pathParameters as unknown as UpdateTransactionPathParameters;
        const body: UpdateTransactionBody = event.body ? JSON.parse(event.body) : {};
        const input: UpdateTransactionInput = {
            ...body,
            ...pathParameters,
            userId,
        };

        Validator.register(
            "at_least_one",
            function (
                this: { validator: ValidatorType<any> },
                value,
                requirement,
                attribute,
            ) {
                const fieldToValidate = this.validator.input[requirement];
                if (typeof fieldToValidate !== "object") return false;
                return Object.keys(fieldToValidate).length > 0;
            },
        );

        // Validate data
        const validator = new Validator(
            { ...input, atLeastOneUpdateInfo: true },
            updateTransactionInputRules,
            {
                "at_least_one.atLeastOneUpdateInfo":
                    "At least one update info must be given.",
            },
        );
        if (validator.fails()) {
            console.log(validator.errors);
            return Utils.getInstance().getErrorResponse(
                ErrorType.TRANSACTIONS__UPDATE__DATA_VALIDATION,
            );
        }
        // Init DB connection
        const initConnectionResponse = await DatabaseUtils.getInstance().initConnection();
        if (initConnectionResponse.err) {
            return Utils.getInstance().getErrorResponse(initConnectionResponse.val);
        }

        const updateTransactionResponse = await TransactionsUtils.updateTransaction(
            input,
        );
        if (updateTransactionResponse.err) {
            return Utils.getInstance().getErrorResponse(updateTransactionResponse.val);
        }

        const response: UpdateTransactionResponseData = {};
        return Utils.getInstance().getSuccessfulResponse(200, response);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.GENERAL__SERVER);
    }
};
