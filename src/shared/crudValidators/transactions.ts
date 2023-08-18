export const getTransactionsValidator = {
    startCarriedOut: "required|integer",
    endCarriedOut: "required|integer",
    currencyId: "required|string",
};

export const getBalanceValidator = {
    startCarriedOut: "required|integer",
    endCarriedOut: "required|integer",
    currencyId: "required|string",
};

export const createTransactionCategoryRules = {
    name: "required|string",
};

export const createTransactionInputRules = {
    name: "required|string",
    walletId: "required|string",
    categoryId: "required|string",
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
        categoryId: "string",
        carriedOut: "integer",
        amount: "numeric|min:0.01",
        isIncome: "boolean",
    },
    atLeastOneUpdateInfo: "at_least_one:updateInfo",
};

export const deleteTransactionInputRules = {
    userId: "required|string",
    id: "required|string",
};
