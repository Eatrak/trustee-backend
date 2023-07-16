export const getTransactionsValidator = {
    startCarriedOut: "required|integer",
    endCarriedOut: "required|integer",
    currencyCode: "required|string"
};

export const createTransactionCategoryRules = {
    name: "required|string"
};

export const createTransactionInputRules = {
    name: "required|string",
    walletId: "required|string",
    categoryId: "required|string",
    carriedOut: "required|integer",
    amount: "required|numeric|min:0.01",
    isIncome: "required|boolean",
    userId: "required|string"
};

export const deleteTransactionInputRules = {
    userId: "required|string",
    id: "required|string"
};
