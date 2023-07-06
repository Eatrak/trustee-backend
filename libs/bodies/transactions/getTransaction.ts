export interface GetTransactionPathParameters {
    walletId: string,
    transactionId: string,
    transactionTimestamp: string,
    currencyCode: string
}

export interface GetTransactionInput extends GetTransactionPathParameters {
    userId: string
}
