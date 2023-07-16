export const getTransactionsValidator = {
    startCarriedOut: "required|integer",
    endCarriedOut: "required|integer",
    currencyCode: "required|string"
};

export const createTransactionCategoryRules = {
    transactionCategoryName: "required|string"
};

export const createTransactionInputRules = {
    transactionName: "required|string",
    walletId: "required|string",
    categoryId: "required|string",
    transactionTimestamp: "required|integer",
    transactionAmount: "required|numeric|min:0.01",
    isIncome: "required|boolean",
    userId: "required|string"
};

export const deleteTransactionInputRules = {
    userId: "required|string",
    transactionId: "required|string"
};
