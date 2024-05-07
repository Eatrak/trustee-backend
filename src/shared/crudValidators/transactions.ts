import { z } from "zod";

export const getTransactionsValidator = {
    startCarriedOut: "required|integer",
    endCarriedOut: "required|integer",
    currencyId: "required|string",
    wallets: "present|array",
};

export const getBalanceValidator = {
    startCarriedOut: "required|integer",
    endCarriedOut: "required|integer",
    currencyId: "required|string",
    wallets: "present|array",
};

export const createTransactionCategoryRules = {
    name: "required|string",
};

export const createTransactionInputRules = {
    name: "required|string",
    walletId: "required|string",
    categories: "required|array",
    carriedOut: "required|integer",
    amount: "required|numeric|min:0.01",
    isIncome: "required|boolean",
    userId: "required|string",
};

export const updateTransactionInputRules = {
    id: "required|string",
    userId: "required|string",
    updateInfo: {
        name: "string",
        walletId: "string",
        categories: "array",
        carriedOut: "integer",
        amount: "numeric|min:0.01",
        isIncome: "boolean",
    },
    // TODO: find a better way to achive the same validation
    atLeastOneUpdateInfo: "at_least_one:updateInfo",
};

export const deleteTransactionInputRules = {
    userId: "required|string",
    id: "required|string",
};

export const getTransactionCategoryBalancesInputRules = {
    startDate: "required_with:endDate,wallets,userId|integer",
    endDate: "required_with:startDate,wallets,userId|integer",
    userId: "required_with:endDate,wallets,startDate|string",
};

export const getTransactionCategoriesInputRules = {
    userId: "required|string",
};

export const getCategoriesOfTransactionInputRules = {
    id: "required|string",
    userId: "required|string",
};

export const getTransactionPathParametersSchema = z.object({
    id: z.string().min(1),
});

export const getTransactionInputSchema = z.object({
    pathParameters: getTransactionPathParametersSchema,
    userId: z.string().min(1),
});
