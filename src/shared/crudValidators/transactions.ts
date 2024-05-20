import Utils from "@utils/Utils";
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

export const updateTransactionPathParametersSchema = z.object({
    id: z.string().min(1),
});

export const updateTransactionBodySchema = z.object({
    updateInfo: z
        .object({
            name: z.string().min(1),
            walletId: z.string().min(1),
            categories: z.array(z.string().min(1)),
            carriedOut: z.number().min(0).int(),
            amount: z.number().min(0.01),
            isIncome: z.boolean(),
        })
        .partial()
        // At least one attribute is defined
        .refine(Utils.getInstance().atLeastOneIsDefined),
});

export const updateTransactionInputSchema = z.object({
    pathParameters: updateTransactionPathParametersSchema,
    body: updateTransactionBodySchema,
    userId: z.string().min(1),
});

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
