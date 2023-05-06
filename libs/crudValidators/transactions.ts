export const getTransactionsValidator = {
    startCreationTimestamp: "integer",
    endCreationTimestamp: "integer"
};

export const createTransactionCategoryRules = {
    transactionCategoryName: "required|string"
};
