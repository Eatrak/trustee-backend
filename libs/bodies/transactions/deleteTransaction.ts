export interface DeleteTransactionQueryParameters {
    walletId: string,
    transactionId: string,
    transactionTimestamp: string,
    currencyCode: string
}

export interface DeleteTransactionInput extends DeleteTransactionQueryParameters {
    userId: string
}
