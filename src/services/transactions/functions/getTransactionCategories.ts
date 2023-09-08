import {
    APIGatewayProxyEvent,
    APIGatewayProxyHandler,
    APIGatewayProxyResult,
} from "aws-lambda";
import Validator from "validatorjs";

import Utils from "@utils/Utils";
import TransactionsUtils from "@utils/TransactionsUtils";
import {
    GetNormalTransactionCategoriesResponseData,
    GetTransactionCategoryBalancesResponseData,
} from "@APIs/output/transactions/getTransactionCategories";
import DatabaseUtils from "@utils/DatabaseUtils";
import ErrorType from "@shared/errors/list";
import {
    GetTransactionCategoryBalancesInputMultiQueryParams,
    GetTransactionCategoryBalancesInputQueryParams,
    GetTransactionCategoriesNormalInput,
    GetTransactionCategoryBalancesInput,
} from "@APIs/input/transactions/getTransactionCategories";
import {
    getTransactionCategoriesInputRules,
    getTransactionCategoryBalancesInputRules,
} from "@crudValidators/transactions";
import { TransactionCategoriesViews } from "@ts-types/DTOs/transactions";

export const handler: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
    const { userId } = Utils.getInstance().getAuthorizerClaims(event);

    try {
        const queryParams =
            event.queryStringParameters as unknown as GetTransactionCategoryBalancesInputQueryParams;
        const multiQueryParams =
            event.multiValueQueryStringParameters as unknown as GetTransactionCategoryBalancesInputMultiQueryParams;

        if (queryParams && multiQueryParams) {
            const input: GetTransactionCategoryBalancesInput = {
                startDate: queryParams.startDate,
                endDate: queryParams.endDate,
                wallets: multiQueryParams.wallets,
                userId,
            };

            // Validate data
            const getTransactionCategoryBalanceValidation = new Validator(
                input,
                getTransactionCategoryBalancesInputRules,
            );
            if (getTransactionCategoryBalanceValidation.passes()) {
                if (!DatabaseUtils.getInstance().getDB()) {
                    // Init DB connection
                    const initConnectionResponse =
                        await DatabaseUtils.getInstance().initConnection();
                    if (initConnectionResponse.err) {
                        return Utils.getInstance().getErrorResponse(
                            initConnectionResponse.val,
                        );
                    }
                }

                const getTransactionCategoryBalancesResponse =
                    await TransactionsUtils.getTransactionCategoryBalances(input);
                if (getTransactionCategoryBalancesResponse.err) {
                    return Utils.getInstance().getErrorResponse(
                        getTransactionCategoryBalancesResponse.val,
                    );
                }
                const transactionCategoryBalances =
                    getTransactionCategoryBalancesResponse.val;

                const response: GetTransactionCategoryBalancesResponseData = {
                    view: TransactionCategoriesViews.WITH_BALANCE,
                    transactionCategories: transactionCategoryBalances,
                };

                return Utils.getInstance().getSuccessfulResponse(200, response);
            }
        }

        const input: GetTransactionCategoriesNormalInput = {
            userId,
        };
        // Validate data
        const getTransactionCategoriesValidation = new Validator(
            input,
            getTransactionCategoriesInputRules,
        );
        if (getTransactionCategoriesValidation.passes()) {
            if (!DatabaseUtils.getInstance().getDB()) {
                // Init DB connection
                const initConnectionResponse =
                    await DatabaseUtils.getInstance().initConnection();
                if (initConnectionResponse.err) {
                    return Utils.getInstance().getErrorResponse(
                        initConnectionResponse.val,
                    );
                }
            }

            const getTransactionCategoriesResponse =
                await TransactionsUtils.getTransactionCategories(userId);
            if (getTransactionCategoriesResponse.err) {
                return Utils.getInstance().getErrorResponse(
                    getTransactionCategoriesResponse.val,
                );
            }
            const transactionCategories = getTransactionCategoriesResponse.val;

            const responseData: GetNormalTransactionCategoriesResponseData = {
                view: TransactionCategoriesViews.NORMAL,
                transactionCategories,
            };
            return Utils.getInstance().getSuccessfulResponse(200, responseData);
        }

        return Utils.getInstance().getErrorResponse(ErrorType.DATA_VALIDATION);
    } catch (err) {
        console.log(err);
        return Utils.getInstance().getErrorResponse(ErrorType.UNKNOWN);
    }
};
